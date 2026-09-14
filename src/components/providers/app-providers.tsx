"use client";

import { Toaster } from "sonner";

type AppProvidersProps = Readonly<{
  children: React.ReactNode;
}>;

export function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <>
      {children}

      <Toaster
        closeButton
        position="bottom-right"
        richColors
      />
    </>
  );
}