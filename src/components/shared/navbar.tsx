import { getCurrentUser, getCurrentRole } from "@/lib/auth/guards";
import { NavbarClient } from "./navbar-client";

/**
 * Navbar - Server Component Wrapper
 * Fetches user & role data, passes to client component
 * Memenuhi requirement auth-aware navigation
 */
export async function Navbar() {
  const { user } = await getCurrentUser();
  const role = user ? await getCurrentRole(user.id) : null;

  return <NavbarClient user={user} role={role} />;
}
