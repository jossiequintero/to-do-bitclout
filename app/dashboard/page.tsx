"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthRepository, type User } from "@/src/services/authRepository";
import { TaskRepository } from "@/src/services/taskRepository";
import {
  type Category,
  type Task,
  type TaskStatus,
} from "@/src/modules/tasks/types";
import { filterTasks } from "@/src/modules/tasks/taskFilters";

interface EditableTask extends Task {
  isEditing?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<EditableTask[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<string>("");

  const [categoryName, setCategoryName] = useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  useEffect(() => {
    const user = AuthRepository.getCurrentUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setCurrentUser(user);
    setCategories(TaskRepository.getCategories());
    setTasks(TaskRepository.getTasks());
  }, [router]);

  useEffect(() => {
    if (categories.length && !newCategoryId) {
      setNewCategoryId(categories[0].id);
    }
  }, [categories, newCategoryId]);

  const handleLogout = () => {
    AuthRepository.logout();
    router.replace("/");
  };

  const handleCreateTask = () => {
    if (!newTitle || !newCategoryId) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title: newTitle,
      description: newDescription,
      categoryId: newCategoryId,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    TaskRepository.saveTask(task);
    setTasks((prev) => [...prev, task]);
    setNewTitle("");
    setNewDescription("");
  };

  const handleDeleteTask = (id: string) => {
    TaskRepository.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTask = (id: string) => {
    TaskRepository.toggleTaskStatus(id);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "pending" ? "completed" : "pending" }
          : t,
      ),
    );
  };

  const handleStartEdit = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isEditing: true } : t)),
    );
  };

  const handleCancelEdit = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isEditing: false } : t)),
    );
  };

  const handleSaveEdit = (id: string, title: string, description: string) => {
    if (!title) return;
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, title, description, isEditing: false } : t,
      );
      const changed = updated.find((t) => t.id === id);
      if (changed) {
        TaskRepository.saveTask(changed);
      }
      return updated;
    });
  };

  const handleCreateCategory = () => {
    if (!categoryName.trim()) return;
    const category: Category = {
      id: crypto.randomUUID(),
      name: categoryName.trim(),
    };
    TaskRepository.saveCategory(category);
    setCategories((prev) => [...prev, category]);
    setCategoryName("");
  };

  const handleLoadDemoTasks = async () => {
    try {
      setIsLoadingDemo(true);
      const response = await fetch("/api/demo-tasks");
      if (!response.ok) {
        throw new Error("No se pudo cargar la API simulada");
      }
      const data = (await response.json()) as Task[];

      setTasks((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newOnes = data.filter((t) => !existingIds.has(t.id));

        newOnes.forEach((task) => TaskRepository.saveTask(task));
        return [...prev, ...newOnes];
      });
    } catch (error) {
      // Para esta prueba solo mostramos el error en consola
      // y evitamos romper la UI.
      console.error(error);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const filteredTasks = useMemo(
    () =>
      filterTasks(tasks, {
        searchText,
        categoryId: categoryFilter || undefined,
        status: statusFilter,
      }),
    [tasks, searchText, categoryFilter, statusFilter],
  );

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? "Sin categoría";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] min-h-[560px]">
      <aside className="border-r border-slate-100 bg-slate-50/60 px-6 py-6">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-1">
            Bienvenido
          </p>
          <h1 className="text-xl font-semibold text-slate-900">
            {currentUser?.name ?? "Usuario"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser?.email}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto mb-4 inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          Cerrar sesión
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-700">
              Categorías
            </h2>
            <span className="text-[11px] text-slate-400">
              {categories.length} total
            </span>
          </div>
          <ul className="space-y-1 mb-3 max-h-48 overflow-y-auto pr-1">
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() =>
                    setCategoryFilter((prev) =>
                      prev === category.id ? "" : category.id,
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs ${
                    categoryFilter === category.id
                      ? "bg-sky-600 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{category.name}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              Nueva categoría
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Ej. Trabajo, Hogar..."
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                className="rounded-md bg-slate-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-800"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>

    
      </aside>

      <main className="px-6 py-6 lg:px-8 lg:py-8 bg-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Tareas
            </h2>
            <p className="text-xs text-slate-500">
              Crea, edita, completa y filtra tus tareas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TaskStatus | "all")
              }
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar por título o descripción..."
              className="w-full lg:w-64 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        <section className="mb-6 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4">
          <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Nueva tarea
            </h3>
            <button
              type="button"
              onClick={handleLoadDemoTasks}
              disabled={isLoadingDemo}
              className="inline-flex items-center rounded-md border border-sky-600 px-3 py-1.5 text-[11px] font-medium text-sky-700 hover:bg-sky-50 disabled:opacity-60"
            >
              {isLoadingDemo ? "Cargando demo..." : "Cargar tareas de ejemplo (API simulada)"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[2fr,3fr,1fr,auto] gap-3 items-start">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Descripción (opcional)"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <select
              value={newCategoryId}
              onChange={(e) => setNewCategoryId(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCreateTask}
              className="rounded-md bg-sky-600 text-white px-4 py-1.5 text-xs font-medium hover:bg-sky-700"
            >
              Añadir
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white">
          <header className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-xs font-medium text-slate-600">
              {filteredTasks.length} tareas encontradas
            </span>
          </header>
          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
            {filteredTasks.length === 0 && (
              <p className="px-4 py-6 text-xs text-slate-500">
                No hay tareas que coincidan con los filtros actuales.
              </p>
            )}
            {filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                categoryName={getCategoryName(task.categoryId)}
                onToggle={() => handleToggleTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
                onStartEdit={() => handleStartEdit(task.id)}
                onCancelEdit={() => handleCancelEdit(task.id)}
                onSaveEdit={handleSaveEdit}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

interface TaskRowProps {
  task: EditableTask;
  categoryName: string;
  onToggle: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, title: string, description: string) => void;
}

function TaskRow({
  task,
  categoryName,
  onToggle,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: TaskRowProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  const created = new Date(task.createdAt);

  const handleSave = () => {
    onSaveEdit(task.id, title, description);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 px-4 py-3">
      <div className="flex items-start gap-3 flex-1">
        <button
          type="button"
          onClick={onToggle}
          className={`mt-1 h-4 w-4 rounded-full border flex items-center justify-center ${
            task.status === "completed"
              ? "border-emerald-500 bg-emerald-500"
              : "border-slate-300 bg-white"
          }`}
        >
          {task.status === "completed" && (
            <span className="h-2 w-2 rounded-full bg-white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {task.isEditing ? (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </>
          ) : (
            <>
              <p
                className={`text-xs font-medium ${
                  task.status === "completed"
                    ? "text-slate-500 line-through"
                    : "text-slate-900"
                }`}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {task.description}
                </p>
              )}
            </>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5">
              {categoryName}
            </span>
            <span>
              Creada el{" "}
              {created.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
              })}
            </span>
            <span
              className={`font-medium ${
                task.status === "completed"
                  ? "text-emerald-600"
                  : "text-amber-600"
              }`}
            >
              {task.status === "completed" ? "Completada" : "Pendiente"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        {task.isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-emerald-600 text-white px-2.5 py-1 font-medium hover:bg-emerald-700"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-md border border-slate-300 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onStartEdit}
              className="rounded-md border border-slate-300 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md bg-red-500 text-white px-2.5 py-1 font-medium hover:bg-red-600"
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );
}


