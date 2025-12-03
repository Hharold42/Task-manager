import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  SortOrder,
  TasksQueryDto,
  TasksSortField,
} from './dto/tasks-query.dto';
import { Prisma } from '@prisma/client';

const taskInclude = {
  author: {
    select: { id: true, email: true, createdAt: true },
  },
  asignee: {
    select: { id: true, email: true, createdAt: true },
  },
} as const;

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: number, dto: CreateTaskDto) {
    let targetAssigneeId: number;

    // на всякий случай, я знаю что этого не нужно по заданию
    if (dto.assigneeId) {
      if (dto.assigneeId === authorId) {
        throw new BadRequestException('Нельзя назначить задачу самому себе');
      }
      const assignee = await this.prisma.user.findUnique({
        where: { id: dto.assigneeId },
      });
      if (!assignee) {
        throw new NotFoundException('Указанный исполнитель не найден');
      }
      targetAssigneeId = assignee.id;
    } else {
      const candidates = await this.prisma.user.findMany({
        where: { NOT: { id: authorId } },
      });
      if (candidates.length === 0) {
        throw new NotFoundException('No other users to assign the task to');
      }
      const random = candidates[Math.floor(Math.random() * candidates.length)];
      targetAssigneeId = random.id;
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        authorId,
        asigneeId: targetAssigneeId,
      },
      include: taskInclude,
    });
  }

  async findAll(params: TasksQueryDto) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 9;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};

    if (params.title) {
      where.title = { contains: params.title, mode: 'insensitive' };
    }

    if (params.authorId) {
      where.authorId = params.authorId;
    }

    if (params.assigneeId) {
      where.asigneeId = params.assigneeId;
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {
        ...(params.dateFrom ? { gte: params.dateFrom } : {}),
        ...(params.dateTo ? { lte: params.dateTo } : {}),
      };
    }

    const orderByField = params.sortBy ?? TasksSortField.CreatedAt;
    const orderDirection = params.order ?? SortOrder.Desc;
    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [orderByField]: orderDirection,
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        include: taskInclude,
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: number, authorId: number, data: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.authorId !== authorId)
      throw new ForbiddenException('Only author can update task');

    let targetAssigneeId = task.asigneeId;
    if (data.assigneeId && data.assigneeId !== task.asigneeId) {
      if (data.assigneeId === authorId) {
        throw new BadRequestException('Нельзя назначить задачу самому себе');
      }
      const assignee = await this.prisma.user.findUnique({
        where: { id: data.assigneeId },
      });
      if (!assignee) {
        throw new NotFoundException('Указанный исполнитель не найден');
      }
      targetAssigneeId = assignee.id;
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        asigneeId: targetAssigneeId,
      },
      include: taskInclude,
    });
  }

  async remove(id: number, authorId: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.authorId !== authorId)
      throw new ForbiddenException('Only author can delete task');

    return this.prisma.task.delete({ where: { id } });
  }
}
