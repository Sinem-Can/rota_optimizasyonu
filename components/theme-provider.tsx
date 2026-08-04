"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// 5. satırdaki sorunlu import işlemini tamamen sildik.
// Bunun yerine tipi (React.ComponentProps) ile doğrudan sağlayıcıdan alıyoruz.

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}