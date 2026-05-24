"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/storage";

type DashboardHeaderProps = {
  title: string;
  profileName: string;
  homeHref?: string;
  accent?: "emerald" | "orange";
  extraLink?: { href: string; label: string };
};

export default function DashboardHeader({
  title,
  profileName,
  homeHref = "/",
  accent = "emerald",
  extraLink,
}: DashboardHeaderProps) {
  const router = useRouter();
  const accentLink =
    accent === "orange" ? "text-orange-700" : "text-emerald-700";
  const accentBorder =
    accent === "orange" ? "border-orange-100" : "border-emerald-100";
  const badgeBg =
    accent === "orange" ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-800";

  function handleLogout() {
    logout();
    router.push("/auth");
  }

  return (
    <header
      className={`border-b ${accentBorder} bg-white/80 backdrop-blur-md`}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0 flex-1">
          <Link href={homeHref} className={`text-sm font-semibold ${accentLink}`}>
            ← ParkIndia
          </Link>
          <h1 className="mt-1 truncate text-xl font-bold text-slate-900">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {extraLink && (
            <Link
              href={extraLink.href}
              className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 sm:inline-flex"
            >
              {extraLink.label}
            </Link>
          )}
          <span
            className={`hidden max-w-[120px] truncate rounded-full px-3 py-1 text-xs font-medium sm:inline-block ${badgeBg}`}
          >
            {profileName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
