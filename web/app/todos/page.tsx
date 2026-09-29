import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TodoList from "../../components/TodoList";
import { listTodos } from "../../lib/api";

type TodoRecord = {
  text?: unknown;
};

function extractTodos(response: unknown): string[] {
  const values = Array.isArray(response)
    ? response
    : response && typeof response === "object"
      ? ((response as { todos?: unknown; items?: unknown }).todos ??
        (response as { items?: unknown }).items)
      : undefined;

  if (!Array.isArray(values)) {
    return [];
  }

  return values.flatMap((todo: unknown) => {
    if (typeof todo === "string") {
      return [todo];
    }
    if (todo && typeof todo === "object") {
      const text = (todo as TodoRecord).text;
      if (typeof text === "string") {
        return [text];
      }
    }
    return [];
  });
}

export default async function TodosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("todo_token")?.value;

  if (!token) {
    redirect("/");
  }

  const response = await listTodos(token);
  const todos = extractTodos(response);

  return (
    <main>
      <h1>Todo list</h1>
      <TodoList token={token} initialTodos={todos} />
    </main>
  );
}
