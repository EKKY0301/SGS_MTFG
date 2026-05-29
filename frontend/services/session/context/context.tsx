"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  LoginCredentials,
  SessionUser,
  loginWithServerAuth,
  logoutWithServerAuth,
  getSessionUser,
} from "@/services/auth/service";

const UNEXPECTED_LOGIN_ERROR_MESSAGE = "Ocurrio un error inesperado.";

function getTextFromUnknownMessage(rawMessage: unknown): string | null {
  if (typeof rawMessage === "string") {
    const trimmedMessage = rawMessage.trim();
    return trimmedMessage === "" ? null : trimmedMessage;
  }

  if (Array.isArray(rawMessage)) {
    const textParts = rawMessage
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);

    return textParts.length > 0 ? textParts.join(", ") : null;
  }

  return null;
}

function formatUnexpectedLoginError(statusCode?: number): string {
  if (statusCode === 500) {
    return `${UNEXPECTED_LOGIN_ERROR_MESSAGE} Error code 500`;
  }

  return UNEXPECTED_LOGIN_ERROR_MESSAGE;
}

function normalizeLoginErrorMessage(loginError: unknown): string {
  if (!(loginError instanceof Error)) {
    return formatUnexpectedLoginError();
  }

  const prefixedMessageMatch = loginError.message.match(/^Server proxy request failed \((\d+)\):\s*([\s\S]*)$/);
  const statusCode = prefixedMessageMatch ? Number(prefixedMessageMatch[1]) : undefined;
  const rawMessage = prefixedMessageMatch ? prefixedMessageMatch[2] : loginError.message;
  const directMessage = getTextFromUnknownMessage(rawMessage);

  if (!directMessage) {
    return formatUnexpectedLoginError(statusCode);
  }

  if (directMessage.startsWith("{") || directMessage.startsWith("[")) {
    try {
      const parsedMessage = JSON.parse(directMessage) as { message?: unknown };
      const nestedMessage = getTextFromUnknownMessage(parsedMessage.message);
      return nestedMessage ?? formatUnexpectedLoginError(statusCode);
    } catch {
      return formatUnexpectedLoginError(statusCode);
    }
  }

  if (directMessage === "[object Object]") {
    return formatUnexpectedLoginError(statusCode);
  }

  return directMessage;
}

type SessionContextValue = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSessionUser()
      .then((sessionUser) => {
        if (sessionUser?.username) {
          setUser(sessionUser);
          setIsAuthenticated(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const nextUser = await loginWithServerAuth(credentials);
      setUser(nextUser);
      setIsAuthenticated(true);
    } catch (loginError) {
      setError(normalizeLoginErrorMessage(loginError));
      setIsAuthenticated(false);
      throw loginError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutWithServerAuth();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAdmin: user?.role === "admin",
      isLoading,
      isSubmitting,
      error,
      login,
      logout,
      clearError,
    }),
    [clearError, error, isAuthenticated, isLoading, isSubmitting, login, logout, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }

  return context;
}
