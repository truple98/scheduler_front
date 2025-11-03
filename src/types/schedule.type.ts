export type ScheduleStatus = 'todo' | 'in_progress' | 'done';
export type SchedulePriority = 'high' | 'medium' | 'low';

export interface Schedule {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  status?: ScheduleStatus;
  priority?: SchedulePriority;
  project?: string | null; // 프로젝트 ID (null이면 일반 일정)
  note?: string; // 메모 필드
}

export interface ScheduleCreateInput {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status?: ScheduleStatus;
  priority?: SchedulePriority;
  project?: string | null;
}

export interface ScheduleUpdateInput {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: ScheduleStatus;
  priority?: SchedulePriority;
  project?: string | null;
}
