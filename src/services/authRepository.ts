export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

const USERS_STORAGE_KEY = "task-manager.users";
const CURRENT_USER_KEY = "task-manager.current-user";

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

export class AuthRepository {
  static getUsers(): User[] {
    if (!isBrowser()) return [];
    return safeParse<User[]>(
      window.localStorage.getItem(USERS_STORAGE_KEY),
      [],
    );
  }

  static saveUser(user: User) {
    if (!isBrowser()) return;
    const users = this.getUsers();
    const existing = users.findIndex((u) => u.email === user.email);
    if (existing >= 0) {
      users[existing] = user;
    } else {
      users.push(user);
    }
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  static register(name: string, email: string, password: string): User {
    if (!isBrowser()) {
      throw new Error("Registro solo disponible en el navegador");
    }
    const users = this.getUsers();
    if (users.some((u) => u.email === email)) {
      throw new Error("El correo ya está registrado");
    }
    const user: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
    };
    this.saveUser(user);
    this.setCurrentUser(user);
    return user;
  }

  static login(email: string, password: string): User {
    if (!isBrowser()) {
      throw new Error("Login solo disponible en el navegador");
    }
    const users = this.getUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Credenciales inválidas");
    }
    this.setCurrentUser(user);
    return user;
  }

  static getCurrentUser(): User | null {
    if (!isBrowser()) return null;
    return safeParse<User | null>(
      window.localStorage.getItem(CURRENT_USER_KEY),
      null,
    );
  }

  static setCurrentUser(user: User | null) {
    if (!isBrowser()) return;
    if (user) {
      window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  static logout() {
    this.setCurrentUser(null);
  }
}


