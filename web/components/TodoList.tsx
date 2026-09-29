"use client";

import { FormEvent, useState } from "react";
import { addTodo } from "../lib/api";

type TodoListProps = {
  token: string;
  initialTodos: string[];
};

export default function TodoList({ token, initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState(initialTodos);
  const [text, setText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newTodo = text.trim();
    if (!newTodo || isAdding) {
      return;
    }

    setIsAdding(true);
    setError("");
    try {
      await addTodo(token, newTodo);
      setTodos((currentTodos) => [...currentTodos, newTodo]);
      setText("");
    } catch {
      setError("Unable to add todo. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <section>
      <ul>
        {todos.map((todo, index) => (
          <li key={`${index}-${todo}`}>{todo}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <label htmlFor="new-todo">New todo</label>
        <input
          id="new-todo"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" disabled={isAdding || !text.trim()}>
          Add
        </button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
    </section>
  );
}
