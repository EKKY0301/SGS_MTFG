"use client";

import { FormProvider, useForm } from "react-hook-form";

export default function RegistroLayout({ children } : { children: React.ReactNode}) {
  const form = useForm({
    defaultValues: {
      role: 'principal',
      hasPartner: false,
      hasFather: false,
      hasMother: false,
      status: 'active',
      children: [],
      joinDate: new Date().toISOString(),
    },
  });

  return (
      <FormProvider {...form}>
        <div className="w-full h-full min-h-0 overflow-y-auto no-scrollbar pb-5">
          {children}
        </div>
      </FormProvider>
  );
}
