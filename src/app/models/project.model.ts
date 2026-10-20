import { Level } from './level.model';

export interface ProjectCreateRequest {
  readonly user_id: string;
  readonly university_id: string;
  readonly faculty: string;
  readonly name: string;
  readonly level: Level;
  readonly program_name: string;
  readonly university_url?: string | null;
}

export interface ProjectResponse {
  readonly id: string;
  readonly user_id: string;
  readonly university_id: string;
  readonly faculty: string;
  readonly name: string;
  readonly level: Level;
  readonly program_name: string;
  readonly university_url: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ApiError {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}
