import Link from "@/components/shared/route-link"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li {...props} />
}

type PaginationLinkProps = React.ComponentProps<typeof Link> & {
  isActive?: boolean
}

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-sm font-medium text-text transition-colors hover:bg-primary-soft hover:text-primary-dark focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isActive && "border-border bg-surface text-primary shadow-sm",
        className,
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Ke halaman sebelumnya"
      className={cn("w-auto gap-1 px-3", className)}
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span>Sebelumnya</span>
    </PaginationLink>
  )
}

function PaginationNext({ className, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Ke halaman berikutnya"
      className={cn("w-auto gap-1 px-3", className)}
      {...props}
    >
      <span>Selanjutnya</span>
      <ChevronRight className="size-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn("flex size-9 items-center justify-center text-text-muted", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">Halaman lainnya</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
