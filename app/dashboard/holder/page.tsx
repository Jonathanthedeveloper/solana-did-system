"use client";

import { useAuth } from "@/components/providers/auth-provider";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { HolderDashboard } from "@/components/holder/holder-dashboard";
import { DIDManagement } from "@/components/holder/did-management";
import { CredentialStorage } from "@/components/holder/credential-storage";
import { ProofRequests } from "@/components/holder/proof-requests";
import { HolderProfile } from "@/components/holder/holder-profile";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";

export const dynamic = "force-dynamic";

export default function HolderPage() {
  const { user } = useAuth();
  const roles = user?.role ? [String(user.role).toLowerCase()] : [];
  const pathname = usePathname();

  // If roles is empty during build, return null to prevent prerendering issues
  if (!roles || roles.length === 0) {
    return null;
  }

  const segment = pathname?.replace(/^\/app\/?/, "") || "dashboard";
  const renderPage = () => {
    switch (segment) {
      case "dashboard":
        return <HolderDashboard />;
      case "did":
        return <DIDManagement />;
      case "credentials":
        return <CredentialStorage />;
      case "proofs":
        return <ProofRequests />;
      case "profile":
        return <HolderProfile />;
      default:
        return <HolderDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {renderPage()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
