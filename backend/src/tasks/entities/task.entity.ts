import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';

export class TaskEntity {
  @ApiProperty({ example: 42 })
  id!: number;

  @ApiProperty({ example: 'Implement auth flow' })
  title!: string;

  @ApiProperty({
    example: 'Add login and registration endpoints with JWT',
    required: false,
  })
  description?: string | null;

  @ApiProperty({ example: '2025-01-10T15:12:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: () => UserEntity })
  author!: UserEntity;

  @ApiProperty({ type: () => UserEntity })
  asignee!: UserEntity;
}

class PaginationMeta {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 12 })
  limit!: number;

  @ApiProperty({ example: 200 })
  total!: number;

  @ApiProperty({ example: 17 })
  totalPages!: number;
}

export class PaginatedTasksResponse {
  @ApiProperty({ type: () => [TaskEntity] })
  data!: TaskEntity[];

  @ApiProperty({ type: () => PaginationMeta })
  meta!: PaginationMeta;
}
