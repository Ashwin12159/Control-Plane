"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { hasRoutePermission } from "@/lib/route-permissions";
import { Loader2 } from "lucide-react";

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function RouteProtection({ children, requiredPermission }: RouteProtectionProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (requiredPermission) {
      const permissions = (session.user as any)?.permissions || [];
      const role = (session.user as any)?.role || null;
      const hasAccess = hasRoutePermission(permissions, role, pathname);

      if (!hasAccess) {
        router.push("/?error=unauthorized");
        return;
      }
    }
  }, [session, status, router, pathname, requiredPermission]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (requiredPermission) {
    const permissions = (session.user as any)?.permissions || [];
    const role = (session.user as any)?.role || null;
    const hasAccess = hasRoutePermission(permissions, role, pathname);

    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
}

