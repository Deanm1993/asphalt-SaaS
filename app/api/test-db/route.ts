import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Test basic connection
    console.log("Testing database connection...");
    
    // Check if app schema tables exist
    console.log("Testing app.tenants table...");
    const { data: tenantsTest, error: tenantsError } = await supabase
      .from("app.tenants")
      .select("id, name")
      .limit(1);
    
    console.log("Tenants test:", { tenantsTest, tenantsError });
    
    // Check if users table exists
    console.log("Testing app.users table...");
    const { data: usersTest, error: usersError } = await supabase
      .from("app.users")
      .select("id, first_name")
      .limit(1);
    
    console.log("Users test:", { usersTest, usersError });
    
    // Check if crews table exists
    console.log("Testing app.crews table...");
    const { data: crewsTest, error: crewsError } = await supabase
      .from("app.crews")
      .select("id, name")
      .limit(1);
    
    console.log("Crews test:", { crewsTest, crewsError });
    
    return NextResponse.json({
      success: true,
      tenantsTest: { data: tenantsTest, error: tenantsError },
      usersTest: { data: usersTest, error: usersError },
      crewsTest: { data: crewsTest, error: crewsError }
    });
    
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { error: "Database test failed", details: error },
      { status: 500 }
    );
  }
}