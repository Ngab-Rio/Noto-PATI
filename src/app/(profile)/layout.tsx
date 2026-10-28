import { ProfileSidebar } from "./components/ProfileSidebar";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - 1/4 width on desktop */}
          <aside className="lg:col-span-1">
            <ProfileSidebar />
          </aside>

          {/* Main Content - 3/4 width on desktop */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
