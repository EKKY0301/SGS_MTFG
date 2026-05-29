"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ModalContainer } from "@/components/modal/modalContainer";

type ModalContextValue = {
  shown: boolean;
  title: string;
  content: React.ReactNode;
  toggleShown: () => void;
  setTitle: (title: string) => void;
  changeContent: (content: React.ReactNode) => void;
  changeConfirmCallback: (_callback: () => void) => void;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  const [title, setTitle] = useState("Confirmar");
  const [content, setContent] = useState<React.ReactNode>(null);

  const toggleShown = useCallback(() => {
    setShown((current) => !current);
  }, []);

  const changeContent = useCallback((newContent: React.ReactNode) => {
    setContent(newContent);
  }, []);

  const changeConfirmCallback = useCallback((_callback: () => void) => {
    return;
  }, []);

  const value = useMemo(
    () => ({
      shown,
      title,
      content,
      toggleShown,
      setTitle,
      changeContent,
      changeConfirmCallback,
    }),
    [changeConfirmCallback, changeContent, content, shown, title, toggleShown],
  );

  return (
    <ModalContext.Provider value={value}>
      <ModalContainer isOpen={shown} title={title} content={content} toggleShown={toggleShown} />
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext(): ModalContextValue {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModalContext must be used within ModalProvider");
  }

  return context;
}
