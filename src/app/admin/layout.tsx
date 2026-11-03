import { requireAdmin } from "@/lib/auth/guards";
import { AdminSubnav } from "@/features/admin/components/admin-subnav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminSubnav />
      <div className="flex-1">{children}</div>
    </div>
  );
}