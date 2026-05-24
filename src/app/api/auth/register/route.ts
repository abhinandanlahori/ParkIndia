import { NextResponse } from "next/server";
import { BETA_ACCESS_CODE } from "@/lib/constants";
import { phoneToAuthEmail, normalizePhone } from "@/lib/auth/phone";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      phone?: string;
      password?: string;
      vehicleRegistration?: string;
      betaCode?: string;
    };

    if (body.betaCode?.trim() !== BETA_ACCESS_CODE) {
      return NextResponse.json(
        { error: "Invalid beta access code." },
        { status: 400 },
      );
    }

    const phone = normalizePhone(body.phone ?? "");
    const password = body.password ?? "";
    const fullName = body.fullName?.trim() ?? "";
    const vehicleRegistration = body.vehicleRegistration?.trim() ?? "";

    if (phone.length !== 10) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit mobile number." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (!fullName || !vehicleRegistration) {
      return NextResponse.json(
        { error: "Full name and vehicle registration are required." },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdmin();
    const email = phoneToAuthEmail(phone);

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: "This phone is already registered. Sign in instead." },
        { status: 409 },
      );
    }

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone,
          vehicle_registration: vehicleRegistration,
        },
      });

    if (createError) {
      const msg = createError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        return NextResponse.json(
          { error: "This phone is already registered. Sign in instead." },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const userId = created.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Account could not be created." },
        { status: 500 },
      );
    }

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        full_name: fullName,
        phone,
        vehicle_registration: vehicleRegistration,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (profileError) {
      return NextResponse.json(
        {
          error:
            "Account created but profile failed. Run supabase/schema.sql in your project.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
