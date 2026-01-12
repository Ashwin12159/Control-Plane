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
