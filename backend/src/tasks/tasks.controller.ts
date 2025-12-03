import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { TasksQueryDto } from './dto/tasks-query.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedTasksResponse, TaskEntity } from './entities/task.entity';

interface JwtRequest extends ExpressRequest {
  user: { id: number; email: string };
}

@ApiTags('Tasks')
@ApiExtraModels(TaskEntity, PaginatedTasksResponse)
@Controller('tasks')
export class TasksController {
  constructor(private tasks: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать задачу' })
  @ApiCreatedResponse({ type: TaskEntity })
  async create(@Request() req: JwtRequest, @Body() dto: CreateTaskDto) {
    return this.tasks.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Список задач' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'authorId', required: false, type: Number })
  @ApiQuery({ name: 'assigneeId', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'title'],
  })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiOkResponse({ type: PaginatedTasksResponse })
  async findAll(@Query() query: TasksQueryDto) {
    return this.tasks.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: TaskEntity })
  @ApiNotFoundResponse({ description: 'Task not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasks.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить задачу' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: TaskEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: JwtRequest,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить задачу' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: TaskEntity })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: JwtRequest,
  ) {
    return this.tasks.remove(id, req.user.id);
  }
}
