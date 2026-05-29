"use client";

import { MemberProvider } from "@/services/members/context/context";


export default function MemberLayout({ children } : { children: React.ReactNode}) {

  return (
    <MemberProvider>
        {children}
    </MemberProvider>
  );
}
