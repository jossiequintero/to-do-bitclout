import { filterTasks } from "@/src/modules/tasks/taskFilters";
import type { Task } from "@/src/modules/tasks/types";

describe("filterTasks", () => {
  const baseTasks: Task[] = [
    {
      id: "1",
      title: "Estudiar Next.js",
      description: "Revisar App Router y APIs internas",
      categoryId: "study",
      createdAt: new Date().toISOString(),
      status: "pending",
    },
    {
      id: "2",
      title: "Hacer ejercicio",
      description: "Salir a caminar 30 minutos",
      categoryId: "personal",
      createdAt: new Date().toISOString(),
      status: "completed",
    },
    {
      id: "3",
      title: "Revisar correos",
      description: "Responder mensajes importantes",
      categoryId: "work",
      createdAt: new Date().toISOString(),
      status: "pending",
    },
  ];

  it("filtra por texto en título o descripción (case-insensitive)", () => {
    const result = filterTasks(baseTasks, { searchText: "next" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");

    const resultByDescription = filterTasks(baseTasks, { searchText: "caminar" });
    expect(resultByDescription).toHaveLength(1);
    expect(resultByDescription[0].id).toBe("2");
  });

  it("filtra por categoría", () => {
    const result = filterTasks(baseTasks, { categoryId: "work" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("filtra por estado pendiente o completada", () => {
    const pending = filterTasks(baseTasks, { status: "pending" });
    const completed = filterTasks(baseTasks, { status: "completed" });

    expect(pending.every((t) => t.status === "pending")).toBe(true);
    expect(completed.every((t) => t.status === "completed")).toBe(true);
  });

  it("combina filtros de texto, categoría y estado", () => {
    const result = filterTasks(baseTasks, {
      searchText: "revisar",
      categoryId: "work",
      status: "pending",
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });
});



