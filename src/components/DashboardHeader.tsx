"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";

type DashboardHeaderProps = {
  title: string;
  extraLink?: { href: string; label: string };
};

export default function DashboardHeader({
  title,
  extraLink,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    router.push("/auth");
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0 flex-1">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
          >
            ← ParkIndia
          </Link>
          <h1 className="mt-0.5 truncate text-lg font-semibold text-zinc-900">
            {title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {extraLink && (
            <Link
              href={extraLink.href}
              className="hidden rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 sm:inline-flex"
            >
              {extraLink.label}
            </Link>
          )}
          {profile && (
            <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 sm:inline">
              {profile.fullName}
            </span>
          )}
          <Button variant="secondary" onClick={handleLogout} className="!py-1.5 !text-xs">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
