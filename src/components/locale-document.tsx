"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { getLocaleFromPathname } from "@/lib/i18n";

export function LocaleDocument() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname || "/");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
