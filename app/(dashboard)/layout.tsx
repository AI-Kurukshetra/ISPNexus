import { auth } from "@/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopHeader } from "@/components/layout/top-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopHeader
          title="Network Operations"
          subtitle="Realtime ISP service orchestration"
          userName={session?.user?.name ?? "Operator"}
          userRole={session?.user?.role}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="ui-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
