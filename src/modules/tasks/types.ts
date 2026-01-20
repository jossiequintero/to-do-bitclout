export type TaskStatus = "pending" | "completed";

export interface Category {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  createdAt: string; // ISO string
  status: TaskStatus;
}

export interface TaskFilterOptions {
  searchText?: string;
  categoryId?: string;
  status?: TaskStatus | "all";
}


