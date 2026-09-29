"use client";

import { useState, type FormEvent } from "react";
import { login, loginAsGhost, register } from "../lib/api";

type AuthResponse = {
  token?: unknown;
  access_token?: unknown;
  accessToken?: unknown;
};

function getToken(response: unknown): string | null {
  if (typeof response === "string" && response.length > 0) {
    return response;
  }

  if (response && typeof response === "object") {
    const authResponse = response as AuthResponse;
    const token =
      authResponse.token ?? authResponse.access_token ?? authResponse.accessToken;
    if (typeof token === "string" && token.length > 0) {
      return token;
    }
  }

  return null;
}

function saveTokenAndRedirect(response: unknown): void {
  const token = getToken(response);
  if (!token) {
    throw new Error("Authentication succeeded, but no token was returned.");
  }

  document.cookie = `todo_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
  window.location.assign("/todos");
}

export default function AuthForm() {
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const action = submitter?.value;
    if (action !== "register" && action !== "login") {
      setError("Choose Register or Login to continue.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setIsPending(true);
    try {
      const response =
        action === "register"
          ? await register(username, password)
          : await login(username, password);
      saveTokenAndRedirect(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to authenticate. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  }

  async function handleGuestLogin() {
    setError("");
    setIsPending(true);
    try {
      const response = await loginAsGhost();
      saveTokenAndRedirect(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to continue as a guest. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section aria-label="Authentication">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            autoComplete="username"
            id="username"
            name="username"
            required
            type="text"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            autoComplete="current-password"
            id="password"
            name="password"
            required
            type="password"
          />
        </div>
        <div>
          <button disabled={isPending} name="action" type="submit" value="register">
            {isPending ? "Please wait…" : "Register"}
          </button>{" "}
          <button disabled={isPending} name="action" type="submit" value="login">
            {isPending ? "Please wait…" : "Login"}
          </button>
        </div>
      </form>

      <button disabled={isPending} onClick={handleGuestLogin} type="button">
        Continue as Guest
      </button>

      {error && (
        <p role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </section>
  );
}
