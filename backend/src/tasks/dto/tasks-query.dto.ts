import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TasksSortField {
  CreatedAt = 'createdAt',
  Title = 'title',
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export class TasksQueryDto {
  @IsOptional()
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @ApiPropertyOptional({ example: 12, default: 9, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 9;

  @IsOptional()
  @ApiPropertyOptional({ example: 'auth' })
  @IsString()
  title?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assigneeId?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @ApiPropertyOptional({ example: '2025-02-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;

  @IsOptional()
  @ApiPropertyOptional({
    enum: TasksSortField,
    default: TasksSortField.CreatedAt,
  })
  @IsEnum(TasksSortField)
  sortBy: TasksSortField = TasksSortField.CreatedAt;

  @IsOptional()
  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.Desc })
  @IsEnum(SortOrder)
  order: SortOrder = SortOrder.Desc;
}
