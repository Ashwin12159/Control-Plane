import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth } from "@/lib/auth";

export interface UserDetails {
  id: string;
  username: string;
  email: string;
  role: string | null;
  permissions: string[];
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const getUserDetails = async (): Promise<UserDetails> => {
  const user = await auth();
  if (!user) {
    throw new Error("User not found");
  }
  return {
    id: user.user?.id as string,
    username: user.user?.name as string,
    email: user.user?.email as string,
    role: (user.user as any)?.role || null,
    permissions: (user.user as any)?.permissions || [],
  };
};

/**
 * Get client IP address from NextRequest
 * Handles various proxy headers (X-Forwarded-For, X-Real-IP, etc.)
 */
export function getClientIP(request: Request | { headers: Headers }): string {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }

  const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  // Try Next.js specific IP header
  const nextIP = (request as any).ip;
  if (nextIP) {
    return nextIP;
  }

  // Fallback to connection remote address if available
  // Note: In Next.js, we don't have direct access to socket, so this is a fallback
  return "unknown";
}
