import { PageHeader } from "@/components/shared/page-header";
import { UserManagement } from "@/components/settings/user-management";

export const metadata = {
    title: "Team | ISPNexus",
};

export default function TeamPage() {
    return (
        <div>
            <PageHeader
                title="Team"
                description="Manage operators and their platform access roles."
            />
            <UserManagement />
        </div>
    );
}
