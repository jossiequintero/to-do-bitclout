## Task Manager - Patrones de Diseño

Este documento cuenta, en un lenguaje más cercano, **qué patrón de diseño se usó** en la prueba técnica y **por qué** se tomó esa decisión.

---

### Patrón principal: Repository Pattern

**¿Qué problema resuelve?**

En una app real, los datos pueden venir de muchos sitios: `localStorage`, una API REST, GraphQL, una base de datos, etc.  
Si dejamos que los componentes de React hablen directamente con cada una de esas fuentes, la lógica de UI se vuelve difícil de mantener y de testear.

El patrón **Repository** ayuda a evitar eso:

- **Encapsula el acceso a datos** (en este proyecto: `localStorage` y datos de ejemplo).
- Expone a la UI una **interfaz simple y estable** (`getTasks`, `login`, `logout`, etc.).
- Permite cambiar la implementación interna (por ejemplo, pasar de `localStorage` a una API real) **sin romper los componentes**.

En este proyecto se aplica el patrón Repository a dos áreas clave:

- **Autenticación / usuarios**
- **Tareas y categorías**

---

### Repository de Autenticación

- Archivo: `src/services/authRepository.ts`
- Clase principal: `AuthRepository`

**¿Qué hace exactamente?**

- Gestiona la colección de usuarios en `localStorage` (`USERS_STORAGE_KEY`).
- Registra usuarios nuevos (`register`).
- Valida credenciales y maneja el inicio de sesión (`login`).
- Mantiene y expone quién es el usuario autenticado (`getCurrentUser`, `setCurrentUser`, `logout`).

Desde la UI (por ejemplo en `app/page.tsx` y `app/register/page.tsx`) **nunca se toca directamente `localStorage`**.  
En su lugar, se usan métodos de alto nivel:

- `AuthRepository.register(name, email, password)`
- `AuthRepository.login(email, password)`
- `AuthRepository.getCurrentUser()`
- `AuthRepository.logout()`

**¿Por qué es útil?**

Las páginas de login/registro solo conocen conceptos de negocio (login, registro, usuario actual),  
no detalles de dónde se guardan esos datos. Si mañana se quiere reemplazar `localStorage` por una API REST/GraphQL,
la mayor parte del cambio ocurriría dentro de `AuthRepository`, manteniendo la misma interfaz pública.

---

### Repository de Tareas y Categorías

- Archivo: `src/services/taskRepository.ts`
- Clase principal: `TaskRepository`
- Tipos de dominio: `Task`, `Category`, `TaskStatus` en `src/modules/tasks/types.ts`

**Responsabilidades principales**

- Proveer las **categorías iniciales** (Trabajo, Personal, Estudio).
- Leer y escribir tareas en `localStorage` (`TASKS_STORAGE_KEY`).
- Leer y escribir categorías en `localStorage` (`CATEGORIES_STORAGE_KEY`).
- Ofrecer operaciones de alto nivel como:
  - `getTasks()`, `saveTask(task)`, `deleteTask(taskId)`, `toggleTaskStatus(taskId)`
  - `getCategories()`, `saveCategory(category)`

La pantalla de dashboard (`app/dashboard/page.tsx`) trabaja siempre contra el repositorio. Por ejemplo:

- Al entrar al dashboard: `TaskRepository.getTasks()` y `TaskRepository.getCategories()`
- Al crear/editar/eliminar tareas: `TaskRepository.saveTask(...)`, `TaskRepository.deleteTask(...)`
- Al marcar una tarea como completada/pendiente: `TaskRepository.toggleTaskStatus(...)`

De esta forma, los componentes **no saben ni necesitan saber** si los datos vienen de `localStorage`,
de una API interna de Next.js o de cualquier otra fuente.

---

### Cómo encaja la API simulada

La prueba también pide consumir una **API simulada**, y se integra sin romper el patrón Repository.

- Ruta implementada: `GET /api/demo-tasks` (`app/api/demo-tasks/route.ts`).
- Devuelve una lista de tareas de ejemplo usando el tipo `Task`.
- En `app/dashboard/page.tsx` hay un botón *“Cargar tareas de ejemplo (API simulada)”* que:
  - Hace `fetch("/api/demo-tasks")`.
  - Recibe las tareas demo.
  - Las guarda pasando por `TaskRepository` para que queden persistidas y unificadas con el resto.

Aunque el origen sea ahora una API interna de Next.js, la **única puerta de entrada** para las tareas en el resto de la app sigue siendo el repositorio, manteniendo el diseño consistente.

---

### Filtros de tareas como lógica de dominio

- Archivo: `src/modules/tasks/taskFilters.ts`
- Función pura: `filterTasks(tasks, options)`

En lugar de mezclar la lógica de filtrado dentro del componente de React, se extrae a un módulo de dominio:

- Permite **reutilizar** la lógica desde cualquier componente o test.
- Hace que el archivo del dashboard sea más legible y enfocado en la presentación.

En el futuro, esta función podría evolucionar a un **Strategy de filtros** (por ejemplo, distintas estrategias de orden y filtrado intercambiables).  
Para esta prueba se mantiene como una función simple, clara y fácilmente testeable.

---

### Resumen de decisiones

- Se eligió **Repository Pattern** porque:
  - Aísla el acceso a `localStorage` de los componentes de UI.
  - Facilita un cambio futuro hacia un backend real sin reescribir toda la app.
  - Centraliza las reglas de negocio básicas de autenticación y gestión de tareas.
- Las páginas dentro de `app/` trabajan siempre contra repositorios, no directamente contra `localStorage` ni `fetch`,  
  cumpliendo el requisito de aplicar al menos un patrón de diseño claro y justificable.



