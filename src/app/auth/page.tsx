"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatIndianPlate, isValidIndianPlate } from "@/lib/utils/plate";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [betaCode, setBetaCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard/driver");
    }
  }, [loading, isAuthenticated, router]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formattedPlate = formatIndianPlate(vehicleRegistration);
    if (!isValidIndianPlate(formattedPlate)) {
      setError("Enter a valid Indian vehicle registration number.");
      return;
    }

    setSubmitting(true);
    const message = await signUp({
      fullName,
      phone,
      password,
      vehicleRegistration: formattedPlate,
      betaCode,
    });
    setSubmitting(false);

    if (message) {
      setError(message);
      return;
    }

    router.push("/dashboard/driver");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const message = await signIn(phone, password);
    setSubmitting(false);

    if (message) {
      setError(message);
      return;
    }

    router.push("/dashboard/driver");
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            ← ParkIndia
          </Link>
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {mode === "login" ? "Sign in" : "Register"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-10">
        <Card>
          {mode === "login" ? (
            <>
              <h1 className="text-xl font-semibold text-zinc-900">Welcome back</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Sign in with your phone and password. Your profile, bookings, and
                listings sync across all devices.
              </p>

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <Input
                  label="Phone number"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your account password"
                  required
                />

                {error && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <Button type="submit" fullWidth disabled={submitting}>
                  {submitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-500">
                New to ParkIndia?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className="font-medium text-zinc-900 hover:underline"
                >
                  Create account
                </button>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-zinc-900">Create account</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Register once with your beta code. Use the same phone and password
                on any device.
              </p>

              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <Input
                  label="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Arjun Mehta"
                  required
                />
                <Input
                  label="Phone number"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  hint="Use at least 8 characters — you'll need this to sign in on other devices."
                  required
                  minLength={8}
                />
                <label className="block">
                  <span className="text-sm font-medium text-zinc-700">
                    Vehicle registration
                  </span>
                  <input
                    required
                    type="text"
                    value={vehicleRegistration}
                    onChange={(e) =>
                      setVehicleRegistration(formatIndianPlate(e.target.value))
                    }
                    placeholder="DL3CXX0000"
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 font-mono text-sm uppercase tracking-wide text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Spaces added automatically (e.g. DL 3C XX 0000).
                  </p>
                </label>
                <Input
                  label="Beta access code"
                  type="password"
                  value={betaCode}
                  onChange={(e) => setBetaCode(e.target.value)}
                  placeholder="Invite code"
                  required
                />

                {error && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <Button type="submit" fullWidth disabled={submitting}>
                  {submitting ? "Creating account…" : "Create account"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-500">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="font-medium text-zinc-900 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
