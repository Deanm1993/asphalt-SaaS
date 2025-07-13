import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const remember = formData.has("remember");

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Authentication error:", error.message);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Set session expiration based on "remember me" option
    if (data.session) {
      const expiresIn = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day
      
      await supabase.auth.updateSession({
        refresh_token: data.session.refresh_token,
        expires_in: expiresIn,
      });
    }

    // Check if user has a tenant assigned
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("tenant_id, role")
      .eq("id", data.user?.id)
      .single();

    if (userError || !userData?.tenant_id) {
      // User exists in auth but not in our users table or has no tenant
      // This could happen if registration wasn't completed
      await supabase.auth.signOut();
      
      return NextResponse.json(
        { error: "Account setup incomplete. Please contact support." },
        { status: 403 }
      );
    }

    // Redirect to dashboard on successful login
    return NextResponse.redirect(new URL("/dashboard", request.url), {
      status: 302,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
