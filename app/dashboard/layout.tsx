import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

import { createClient } from "@/lib/supabase";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { ViableLogo } from "@/components/viable-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/login");
  }
  
  // Get user profile and tenant information
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select(`
      *,
      tenants:tenant_id (
        name,
        slug,
        logo_url,
        subscription_tier,
        subscription_status,
        trial_ends_at
      )
    `)
    .eq("id", session.user.id)
    .single();
  
  if (userError || !userData) {
    // If user profile not found, sign out and redirect
    await supabase.auth.signOut();
    redirect("/login?error=profile-not-found");
  }
  
  // Check if tenant is active
  const tenant = userData.tenants;
  const isTrialExpired = tenant.subscription_status === "trial" && 
    new Date(tenant.trial_ends_at) < new Date();
  
  const isPastDue = tenant.subscription_status === "past_due";
  
  if (isTrialExpired || isPastDue) {
    redirect("/dashboard/subscription?status=expired");
  }
  
  // Navigation items for asphalt contractors
  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "layout-dashboard",
    },
    {
      title: "Jobs",
      href: "/dashboard/jobs",
      icon: "clipboard-list",
      children: [
        {
          title: "All Jobs",
          href: "/dashboard/jobs",
        },
        {
          title: "New Job",
          href: "/dashboard/jobs/new",
        },
        {
          title: "Quotes",
          href: "/dashboard/jobs/quotes",
        },
        {
          title: "Scheduled",
          href: "/dashboard/jobs/scheduled",
        },
        {
          title: "Completed",
          href: "/dashboard/jobs/completed",
        },
      ],
    },
    {
      title: "Schedule",
      href: "/dashboard/schedule",
      icon: "calendar",
    },
    {
      title: "Customers",
      href: "/dashboard/customers",
      icon: "users",
    },
    {
      title: "Sites",
      href: "/dashboard/sites",
      icon: "map-pin",
    },
    {
      title: "Crews",
      href: "/dashboard/crews",
      icon: "hard-hat",
    },
    {
      title: "Materials",
      href: "/dashboard/materials",
      icon: "truck",
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: "bar-chart",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b bg-background lg:hidden">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ViableLogo className="h-6 w-auto" />
            <span className="font-bold">Viable</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNav 
              items={navigationItems}
              user={userData}
              tenant={tenant}
            />
          </div>
        </div>
      </header>
      
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Sidebar for desktop */}
        <aside className="fixed top-0 z-30 hidden h-screen border-r bg-background md:sticky md:block">
          <div className="flex h-full flex-col gap-2">
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <ViableLogo className="h-6 w-auto" />
                <span>Viable</span>
              </Link>
            </div>
            <DashboardSidebar items={navigationItems} className="px-4 py-2" />
            <div className="mt-auto p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {tenant.subscription_tier.charAt(0).toUpperCase() + tenant.subscription_tier.slice(1)} Plan
                </div>
                {tenant.subscription_status === "trial" && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/subscription">
                      Upgrade
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex flex-col">
          {/* Desktop header */}
          <header className="sticky top-0 z-40 hidden h-16 items-center gap-4 border-b bg-background px-6 lg:flex">
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{tenant.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserNav user={userData} tenant={tenant} />
            </div>
          </header>
          
          {/* Page content */}
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
      
      {/* Offline indicator */}
      <div id="offline-indicator" className="offline-indicator hidden">
        You are offline. Some features may be unavailable.
      </div>
    </div>
  );
}
