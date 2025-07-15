'use client';

import { FC, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Tables } from "@/lib/database.types";

interface NavItem {
  title: string;
  href: string;
  icon: string;
  children?: {
    title: string;
    href: string;
  }[];
}

interface MobileNavProps {
  items: NavItem[];
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

export const MobileNav: FC<MobileNavProps> = ({ items, user, tenant }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[300px] flex-col p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-left">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || undefined} alt={`${user.first_name} ${user.last_name}`} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-medium">{user.first_name} {user.last_name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <div className="px-2 py-4">
            <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {tenant.name}
            </div>
            <nav className="grid gap-1 px-2">
              {items.map((item, index) => {
                // Check if this item or any of its children is active
                const isActive = pathname === item.href || 
                  (item.children?.some(child => pathname === child.href) ?? false);
                
                // Get the icon component
                const Icon = Icons[item.icon as keyof typeof Icons] || Icons.placeholder;
                
                // If the item has children, render a collapsible section
                if (item.children && item.children.length > 0) {
                  // Default to open if any child is active
                  const defaultOpen = item.children.some(child => pathname === child.href);
                  
                  return (
                    <Collapsible key={index} defaultOpen={defaultOpen} className="w-full">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-between font-normal",
                            isActive && "font-medium"
                          )}
                        >
                          <div className="flex items-center">
                            <Icon className="mr-2 h-4 w-4" />
                            {item.title}
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-6 pt-1">
                        <div className="grid gap-1">
                          {item.children.map((child, childIndex) => (
                            <SheetClose key={childIndex} asChild>
                              <Button
                                variant={pathname === child.href ? "secondary" : "ghost"}
                                size="sm"
                                className={cn(
                                  "w-full justify-start font-normal",
                                  pathname === child.href && "font-medium"
                                )}
                                asChild
                              >
                                <Link href={child.href}>
                                  {child.title}
                                </Link>
                              </Button>
                            </SheetClose>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }
                
                // For items without children, render a simple button
                return (
                  <SheetClose key={index} asChild>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start font-normal",
                        isActive && "font-medium"
                      )}
                      asChild
                    >
                      <Link href={item.href}>
                        <Icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </Link>
                    </Button>
                  </SheetClose>
                );
              })}
            </nav>
            
            <Separator className="my-4" />
            
            {/* User-related navigation */}
            <div className="grid gap-1 px-2">
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/dashboard/profile">
                    <Icons.user className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/dashboard/company">
                    <Icons.building className="mr-2 h-4 w-4" />
                    Company Settings
                  </Link>
                </Button>
              </SheetClose>
              {user.role === "owner" || user.role === "admin" ? (
                <SheetClose asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link href="/dashboard/users">
                      <Icons.users className="mr-2 h-4 w-4" />
                      User Management
                    </Link>
                  </Button>
                </SheetClose>
              ) : null}
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/dashboard/subscription">
                    <Icons.creditCard className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span>Subscription</span>
                      <span className="text-xs text-muted-foreground">
                        {tenant.subscription_tier.charAt(0).toUpperCase() + tenant.subscription_tier.slice(1)}
                        {trialDays !== null ? ` (${trialDays} days left)` : ""}
                      </span>
                    </div>
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/dashboard/help">
                    <Icons.helpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </Link>
                </Button>
              </SheetClose>
            </div>
          </div>
        </ScrollArea>
        
        <SheetFooter className="border-t p-4">
          <form action="/api/auth/signout" method="post" className="w-full">
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-destructive">
              <Icons.logOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
