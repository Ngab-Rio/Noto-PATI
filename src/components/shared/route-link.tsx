"use client";

import NextLink, { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

function PendingIndicator() {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <>
      <Loader2
        className="ml-1 h-3.5 w-3.5 shrink-0 motion-safe:animate-spin"
        aria-hidden="true"
      />
      <span className="sr-only" role="status">
        Halaman sedang dibuka
      </span>
    </>
  );
}

export default function RouteLink(props: ComponentProps<typeof NextLink>) {
  return (
    <NextLink {...props}>
      {props.children}
      <PendingIndicator />
    </NextLink>
  );
}
