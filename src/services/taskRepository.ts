import { Task, Category } from "@/src/modules/tasks/types";

const TASKS_STORAGE_KEY = "task-manager.tasks";
const CATEGORIES_STORAGE_KEY = "task-manager.categories";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "work", name: "Trabajo" },
  { id: "personal", name: "Personal" },
  { id: "study", name: "Estudio" },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export class TaskRepository {
  static getCategories(): Category[] {
    if (!isBrowser()) {
      return DEFAULT_CATEGORIES;
    }
    const stored = safeParse<Category[]>(
      window.localStorage.getItem(CATEGORIES_STORAGE_KEY),
      [],
    );
    if (!stored.length) {
      window.localStorage.setItem(
        CATEGORIES_STORAGE_KEY,
        JSON.stringify(DEFAULT_CATEGORIES),
      );
      return DEFAULT_CATEGORIES;
    }
    return stored;
  }

  static saveCategory(category: Category) {
    if (!isBrowser()) return;
    const categories = this.getCategories();
    const existingIndex = categories.findIndex((c) => c.id === category.id);
    if (existingIndex >= 0) {
      categories[existingIndex] = category;
    } else {
      categories.push(category);
    }
    window.localStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(categories),
    );
  }

  static getTasks(): Task[] {
    if (!isBrowser()) {
      return [];
    }
    return safeParse<Task[]>(
      window.localStorage.getItem(TASKS_STORAGE_KEY),
      [],
    );
  }

  static saveTask(task: Task) {
    if (!isBrowser()) return;
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }

  static deleteTask(taskId: string) {
    if (!isBrowser()) return;
    const tasks = this.getTasks().filter((t) => t.id !== taskId);
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }

  static toggleTaskStatus(taskId: string) {
    if (!isBrowser()) return;
    const tasks = this.getTasks().map((t) =>
      t.id === taskId
        ? { ...t, status: t.status === "pending" ? "completed" : "pending" }
        : t,
    );
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }
}


