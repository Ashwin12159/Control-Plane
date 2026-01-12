import { auth } from "./auth";
import { redirect } from "next/navigation";
import { hasRoutePermission } from "./route-permissions";

/**
 * Server-side route guard to protect pages based on permissions
 * Use this in page components to redirect unauthorized users
 */
export async function requireRoutePermission(route: string) {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  const permissions = (session.user as any)?.permissions || [];
  const role = (session.user as any)?.role || null;

  const hasAccess = hasRoutePermission(permissions, role, route);

  if (!hasAccess) {
    redirect("/?error=unauthorized");
  }

  return { session, permissions, role };
}

