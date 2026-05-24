"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import {
  BETA_ACCESS_CODE,
  formatIndianPlate,
  getRegisteredProfile,
  isLoggedIn,
  isValidIndianPlate,
  loginSession,
  loginWithPhone,
  registerProfile,
} from "@/lib/storage";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [registeredName, setRegisteredName] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [betaCode, setBetaCode] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/dashboard/driver");
      return;
    }

    const registered = getRegisteredProfile();
    if (registered) {
      setRegisteredName(registered.fullName);
      setMode("login");
      setLoginPhone(registered.phone);
    } else {
      setMode("register");
    }
  }, [router]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (betaCode.trim() !== BETA_ACCESS_CODE) {
      setError("Invalid beta access code. Sign-up is restricted to invited users.");
      return;
    }

    const formattedPlate = formatIndianPlate(vehicleRegistration);
    if (!isValidIndianPlate(formattedPlate)) {
      setError(
        "Enter a valid Indian plate from any state (e.g. DL 3C XX 0000, MH 12 AB 1234, KA 01 MA 2345, or 22 BH 1234 AA).",
      );
      return;
    }

    const sanitizedPhone = phone.replace(/\D/g, "").slice(-10);
    if (sanitizedPhone.length < 10) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);

    const profile = {
      fullName: fullName.trim(),
      phone: sanitizedPhone,
      vehicleRegistration: formattedPlate,
    };

    try {
      const supabase = createSupabaseClient();
      const email = `${sanitizedPhone}@parkindia.beta`;

      await supabase.auth.signUp({
        email,
        password: `${BETA_ACCESS_CODE}-${sanitizedPhone}`,
        options: {
          data: {
            full_name: profile.fullName,
            phone: profile.phone,
            vehicle_registration: profile.vehicleRegistration,
          },
        },
      });
    } catch {
      // Registration UI remains functional even if Supabase auth is unavailable.
    }

    registerProfile(profile);
    router.push("/dashboard/driver");
  }

  function handleQuickLogin() {
    setError(null);
    if (loginSession()) {
      router.push("/dashboard/driver");
      return;
    }
    setError("No saved profile found. Please register first.");
  }

  function handlePhoneLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!loginWithPhone(loginPhone)) {
      setError("Phone number does not match your registered profile.");
      return;
    }

    router.push("/dashboard/driver");
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-orange-50 via-white to-emerald-50">
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-semibold text-orange-700">
            ← ParkIndia
          </Link>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
            {mode === "login" ? "Welcome back" : "Beta Registration"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40 sm:p-8">
          {mode === "login" ? (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
              <p className="mt-2 text-sm text-slate-600">
                Your profile is saved on this device — no need to re-enter name,
                phone, or vehicle details.
              </p>

              {registeredName && (
                <button
                  type="button"
                  onClick={handleQuickLogin}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/20 transition hover:opacity-95"
                >
                  Continue as {registeredName}
                </button>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400">or verify phone</span>
                </div>
              </div>

              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Registered phone number
                  </span>
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="9876543210"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                  Log in with phone
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
              <p className="mt-2 text-sm text-slate-600">
                One-time registration for the Delhi NCR beta. You will only need
                your beta code once.
              </p>

              <form onSubmit={handleRegister} className="mt-6 space-y-5">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Full Name</span>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Arjun Mehta"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Phone Number
                  </span>
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Vehicle Registration
                  </span>
                  <input
                    required
                    type="text"
                    value={vehicleRegistration}
                    onChange={(e) =>
                      setVehicleRegistration(formatIndianPlate(e.target.value))
                    }
                    placeholder="MH 12 AB 1234 or DL 3C XX 0000"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono uppercase tracking-wide text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Beta Access Code
                  </span>
                  <input
                    required
                    type="password"
                    value={betaCode}
                    onChange={(e) => setBetaCode(e.target.value)}
                    placeholder="Enter invite code"
                    className="mt-1.5 w-full rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </label>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating account…" : "Register & Continue"}
                </button>
              </form>
            </>
          )}

          {getRegisteredProfile() && mode === "register" && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="font-medium text-emerald-700 hover:underline"
              >
                Log in instead
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
