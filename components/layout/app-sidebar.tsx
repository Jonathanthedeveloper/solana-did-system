"use client";

import {
  FileText,
  Eye,
  Key,
  User,
  CreditCard,
  CheckCircle,
  Home,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../providers/auth-provider";
import { UserRole } from "@/lib/generated/prisma/enums";

const pages = [
  {
    url: "/dashboard",
    label: "Dashboard",
    icon: Home,
    roles: [UserRole.HOLDER, UserRole.ISSUER, UserRole.VERIFIER],
  },
  {
    url: "/dashboard/did",
    label: "My DID",
    icon: Key,
    roles: [UserRole.HOLDER],
  },
  {
    url: "/dashboard/credentials",
    label: "Credentials",
    icon: CreditCard,
    roles: [UserRole.HOLDER],
  },
  {
    url: "/dashboard/proofs",
    label: "Proof Requests",
    icon: CheckCircle,
    roles: [UserRole.HOLDER],
  },
  {
    url: "/dashboard/profile",
    label: "Profile",
    icon: User,
    roles: [UserRole.HOLDER],
  },
  {
    url: "/dashboard/issue",
    label: "Issue Credentials",
    icon: FileText,
    roles: [UserRole.ISSUER],
  },
  {
    url: "/dashboard/templates",
    label: "Templates",
    icon: CreditCard,
    roles: [UserRole.ISSUER],
  },
  {
    url: "/dashboard/issued",
    label: "Issued Credentials",
    icon: CheckCircle,
    roles: [UserRole.ISSUER],
  },
  {
    url: "/dashboard/revoked",
    label: "Revoked",
    icon: Eye,
    roles: [UserRole.ISSUER],
  },
  {
    url: "/dashboard/verify",
    label: "Verify Credentials",
    icon: Eye,
    roles: [UserRole.VERIFIER],
  },
  {
    url: "/dashboard/requests",
    label: "Proof Requests",
    icon: FileText,
    roles: [UserRole.VERIFIER],
  },
  {
    url: "/dashboard/history",
    label: "History",
    icon: CheckCircle,
    roles: [UserRole.VERIFIER],
  },
  {
    url: "/dashboard/settings",
    label: "Settings",
    icon: User,
    roles: [UserRole.VERIFIER],
  },
];

export function AppSidebar() {
  const { disconnect } = useWallet();
  const pathname = usePathname();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const pagesToShow = pages.filter((page) => {
    return page.roles.some((role: string) => user?.role === role);
  });

  const handleDisconnect = async () => {
    await disconnect();
    queryClient.clear();
    queryClient.resetQueries();
    2;
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">
              Solana DID
            </h2>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="mt-2">
        <SidebarMenu>
          {pagesToShow.map((page) => {
            const PageIcon = page.icon;
            const isActive = pathname === page.url;
            return (
              <SidebarMenuItem key={page.url}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={page.label}
                  asChild
                >
                  <Link href={page.url}>
                    <PageIcon className="w-4 h-4" />
                    <span>{page.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          className="w-full justify-start gap-2 text-xs"
        >
          <LogOut className="w-3 h-3" />
          Disconnect
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
