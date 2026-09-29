const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type RequestOptions = {
  token?: string;
  body?: unknown;
};

async function request<T>(
  path: string,
  method: "GET" | "POST",
  { token, body }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `API request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function register(username: string, password: string): Promise<unknown> {
  return request("/auth/register", "POST", { body: { username, password } });
}

export function login(username: string, password: string): Promise<unknown> {
  return request("/auth/login", "POST", { body: { username, password } });
}

export function loginAsGhost(): Promise<unknown> {
  return request("/auth/ghost", "POST");
}

export function listTodos(token: string): Promise<unknown> {
  return request("/todos", "GET", { token });
}

export function addTodo(token: string, text: string): Promise<unknown> {
  return request("/todos", "POST", { token, body: { text } });
}
