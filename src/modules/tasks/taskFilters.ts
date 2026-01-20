import { Task, TaskFilterOptions } from "@/src/modules/tasks/types";

export function filterTasks(tasks: Task[], options: TaskFilterOptions): Task[] {
  const { searchText = "", categoryId, status = "all" } = options;
  const normalizedSearch = searchText.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch =
      !normalizedSearch ||
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.description.toLowerCase().includes(normalizedSearch);

    const matchesCategory = !categoryId || task.categoryId === categoryId;

    const matchesStatus =
      status === "all" ? true : task.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });
}


