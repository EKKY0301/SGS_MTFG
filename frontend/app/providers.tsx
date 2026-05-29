"use client";

import { ApiProvider } from "../services/api/context/context";
import { ModalProvider } from "../services/modal/context/context";
import { SessionProvider } from "../services/session/context/context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ModalProvider>
        <ApiProvider>{children}</ApiProvider>
      </ModalProvider>
    </SessionProvider>
  );
}
