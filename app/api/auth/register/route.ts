import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient, validateABN, formatABN } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract business details
    const businessName = formData.get("business_name") as string;
    const abn = formData.get("abn") as string;
    const acn = formData.get("acn") as string || null;
    const gstRegistered = formData.get("gst_registered") === "true";
    
    // Extract address
    const addressLine1 = formData.get("address_line1") as string;
    const addressLine2 = formData.get("address_line2") as string || null;
    const suburb = formData.get("suburb") as string;
    const state = formData.get("state") as string;
    const postcode = formData.get("postcode") as string;
    
    // Extract contact details
    const phone = formData.get("phone") as string || null;
    const email = formData.get("email") as string;
    const website = formData.get("website") as string || null;
    
    // Extract user details
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const userEmail = formData.get("user_email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;
    
    // Basic validation
    if (!businessName || !abn || !addressLine1 || !suburb || !state || !postcode || 
        !email || !firstName || !lastName || !userEmail || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Validate ABN format
    if (!validateABN(abn)) {
      return NextResponse.json(
        { error: "Invalid ABN format or checksum" },
        { status: 400 }
      );
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Format ABN properly
    const formattedABN = formatABN(abn);
    
    // Generate a slug from business name
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Start a transaction by creating the tenant first
    const tenantId = uuidv4();
    
    const { error: tenantError } = await supabase
      .from("app.tenants")
      .insert({
        id: tenantId,
        name: businessName,
        slug: `${slug}-${tenantId.substring(0, 8)}`, // Ensure uniqueness
        abn: formattedABN,
        acn,
        gst_registered: gstRegistered,
        address_line1: addressLine1,
        address_line2: addressLine2,
        suburb,
        state,
        postcode,
        phone,
        email,
        website,
        subscription_tier: "basic",
        subscription_status: "trial",
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
      });
    
    if (tenantError) {
      console.error("Tenant creation error:", JSON.stringify(tenantError, null, 2));
      console.error("Tenant error type:", typeof tenantError);
      console.error("Tenant error message:", tenantError?.message);
      
      // Check for duplicate ABN
      if (tenantError?.message && tenantError.message.includes("unique constraint") && tenantError.message.includes("abn")) {
        return NextResponse.json(
          { error: "An account with this ABN already exists" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to create business account" },
        { status: 500 }
      );
    }
    
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userEmail,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          tenant_id: tenantId,
        },
      },
    });
    
    if (authError) {
      console.error("Auth error:", authError);
      
      // Clean up the tenant if auth fails
      await supabase
        .from("app.tenants")
        .delete()
        .eq("id", tenantId);
      
      // Check for duplicate email
      if (authError.message && authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "This email is already registered" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }
    
    // Create user profile in our users table
    const userId = authData.user?.id;
    
    if (!userId) {
      // Clean up the tenant if user ID is missing
      await supabase
        .from("app.tenants")
        .delete()
        .eq("id", tenantId);
      
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }
    
    const { error: userError } = await supabase
      .from("app.users")
      .insert({
        id: userId,
        tenant_id: tenantId,
        first_name: firstName,
        last_name: lastName,
        email: userEmail,
        role: "owner", // First user is always the owner
      });
    
    if (userError) {
      console.error("User profile error:", userError);
      
      // Clean up auth user and tenant if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      await supabase
        .from("app.tenants")
        .delete()
        .eq("id", tenantId);
      
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }
    
    // Create a default crew for the tenant
    const { error: crewError } = await supabase
      .from("app.crews")
      .insert({
        tenant_id: tenantId,
        name: "Main Crew",
        color: "#3498DB",
      });
    
    if (crewError) {
      console.error("Crew creation error:", crewError);
      // Non-critical error, we can continue
    }
    
    // Sign in the user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password,
    });
    
    if (signInError) {
      console.error("Sign in error:", signInError);
      // Non-critical error, user can sign in manually
    }
    
    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url), {
      status: 302,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
