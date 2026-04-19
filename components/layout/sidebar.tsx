'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ScanLine, 
  ShoppingCart, 
  CalendarCheck, 
  History, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { useAuth } from '@/components/auth/auth-provider';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Scan', href: '/scan', icon: ScanLine },
  { name: 'Shopping List', href: '/shopping', icon: ShoppingCart },
  { name: 'Refill Tasks', href: '/tasks', icon: CalendarCheck },
  { name: 'History', href: '/history', icon: History },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className={cn("pb-12 h-full flex flex-col", className)}>
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Package className="w-8 h-8" />
          StockFlow
        </h2>
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className={cn(
                "group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}>
                <item.icon className={cn("mr-3 h-5 w-5", pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="px-4 mt-auto pt-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl px-4 py-6"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        }
      />
      <SheetContent side="left" className="p-0 w-72">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
