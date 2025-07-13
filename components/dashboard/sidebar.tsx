import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";

interface NavItem {
  title: string;
  href: string;
  icon: string;
  children?: {
    title: string;
    href: string;
  }[];
}

interface SidebarProps {
  items: NavItem[];
  className?: string;
}

export function DashboardSidebar({ items, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <ScrollArea className={cn("h-full py-2", className)}>
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
                      <Button
                        key={childIndex}
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
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          }
          
          // For items without children, render a simple button
          return (
            <Button
              key={index}
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
          );
        })}
      </nav>
    </ScrollArea>
  );
}
