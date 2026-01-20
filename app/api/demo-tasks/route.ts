import { NextResponse } from "next/server";
import type { Task } from "@/src/modules/tasks/types";

export async function GET() {
  const now = new Date();

  const demoTasks: Task[] = [
    {
      id: "demo-1",
      title: "Revisar correos importantes",
      description: "Responder a clientes y priorizar solicitudes pendientes.",
      categoryId: "work",
      createdAt: now.toISOString(),
      status: "pending",
    },
    {
      id: "demo-2",
      title: "Estudiar Next.js App Router",
      description: "Repasar routing, layouts anidados y APIs internas.",
      categoryId: "study",
      createdAt: now.toISOString(),
      status: "pending",
    },
    {
      id: "demo-3",
      title: "Tiempo personal",
      description: "Salir a caminar 30 minutos para despejar la mente.",
      categoryId: "personal",
      createdAt: now.toISOString(),
      status: "completed",
    },
  ];

  return NextResponse.json(demoTasks);
}


