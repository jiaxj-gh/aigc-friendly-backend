import { PowerTaskStatus } from '@app-types/power-system/power-task.types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'power_system_task_summary',
  comment: 'PowerSystem 用电任务汇总表',
})
@Index('idx_power_system_task_summary_status', ['status'])
@Index('idx_power_system_task_summary_start_time', ['startTime'])
export class PowerTaskSummaryEntity {
  @PrimaryGeneratedColumn({
    name: 'task_id',
    type: 'int',
    comment: '任务 ID',
  })
  taskId!: number;

  @Column({
    name: 'task_name',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '任务名称',
  })
  taskName!: string | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 32,
    comment: '任务状态',
  })
  status!: PowerTaskStatus;

  @Column({
    name: 'start_time',
    type: 'datetime',
    nullable: true,
    comment: '任务开始时间',
  })
  startTime!: Date | null;

  @Column({
    name: 'end_time',
    type: 'datetime',
    nullable: true,
    comment: '任务结束时间',
  })
  endTime!: Date | null;

  @Column({
    name: 'upload_summary',
    type: 'json',
    comment: '上传阶段详情 JSON',
  })
  uploadSummary!: Record<string, unknown>;

  @Column({
    name: 'compute_summary',
    type: 'json',
    comment: '计算阶段详情 JSON',
  })
  computeSummary!: Record<string, unknown>;

  @Column({
    name: 'error_message',
    type: 'text',
    nullable: true,
    comment: '任务异常信息',
  })
  errorMessage!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    comment: '创建时间（系统事件时间）',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    comment: '更新时间（系统事件时间）',
  })
  updatedAt!: Date;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '创建人标识',
  })
  createdBy!: string | null;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '更新人标识',
  })
  updatedBy!: string | null;
}
