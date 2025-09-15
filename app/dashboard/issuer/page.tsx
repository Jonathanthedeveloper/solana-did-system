"use client";

import { useAuth } from "@/components/providers/auth-provider";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { IssuerDashboard } from "@/components/issuer/issuer-dashboard";
import { IssueCredential } from "@/components/issuer/issue-credential";
import { CredentialTemplates } from "@/components/issuer/credential-templates";
import { IssuedCredentials } from "@/components/issuer/issued-credentials";
import { RevokedCredentials } from "@/components/issuer/revoked-credentials";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";

export const dynamic = "force-dynamic";

export default function IssuerPage() {
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
        return <IssuerDashboard />;
      case "issue":
        return <IssueCredential />;
      case "templates":
        return <CredentialTemplates />;
      case "issued":
        return <IssuedCredentials />;
      case "revoked":
        return <RevokedCredentials />;
      default:
        return <IssuerDashboard />;
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
