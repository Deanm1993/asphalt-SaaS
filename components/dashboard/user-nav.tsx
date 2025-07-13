import { FC } from "react";
import Link from "next/link";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tables } from "@/lib/database.types";

interface UserNavProps {
  user: Tables<"users"> & {
    tenants: {
      name: string;
      slug: string;
      logo_url: string | null;
      subscription_tier: string;
      subscription_status: string;
      trial_ends_at: string | null;
    }
  };
  tenant: {
    name: string;
    slug: string;
    logo_url: string | null;
    subscription_tier: string;
    subscription_status: string;
    trial_ends_at: string | null;
  };
}

export const UserNav: FC<UserNavProps> = ({ user, tenant }) => {
  // Get user initials for avatar fallback
  const getInitials = () => {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
  };

  // Format subscription status for display
  const formatSubscriptionStatus = (status: string) => {
    switch (status) {
      case "trial":
        return "Trial";
      case "active":
        return "Active";
      case "past_due":
        return "Past Due";
      case "cancelled":
        return "Cancelled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Calculate days remaining in trial
  const getTrialDaysRemaining = () => {
    if (tenant.subscription_status !== "trial" || !tenant.trial_ends_at) {
      return null;
    }

    const trialEndDate = new Date(tenant.trial_ends_at);
    const today = new Date();
    const diffTime = trialEndDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const trialDays = getTrialDaysRemaining();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url || undefined} alt={`${user.first_name} ${user.last_name}`} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.first_name} {user.last_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              Profile Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/company">
              Company Settings
            </Link>
          </DropdownMenuItem>
          {user.role === "owner" || user.role === "admin" ? (
            <DropdownMenuItem asChild>
              <Link href="/dashboard/users">
                User Management
              </Link>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/subscription">
              <div className="flex flex-col">
                <span>Subscription</span>
                <span className="text-xs text-muted-foreground">
                  {tenant.subscription_tier.charAt(0).toUpperCase() + tenant.subscription_tier.slice(1)} - {formatSubscriptionStatus(tenant.subscription_status)}
                  {trialDays !== null ? ` (${trialDays} days left)` : ""}
                </span>
              </div>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/help">
            Help & Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="w-full text-left">
              Log out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
