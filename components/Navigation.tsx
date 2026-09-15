'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  CreditCard, 
  Gamepad2, 
  BarChart3, 
  Settings, 
  Upload 
} from 'lucide-react';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Library', href: '/library', icon: BookOpen },
  { name: 'Flashcards', href: '/flashcards', icon: CreditCard },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Progress', href: '/progress', icon: BarChart3 },
  { name: 'Import', href: '/import', icon: Upload },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
  const pathname = usePathname();
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isHydrated) {
    return <nav className={cn("space-y-1", className)} aria-hidden="true" />;
  }

  return (
    <nav className={cn("space-y-1", className)}>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className = "" }: MobileNavigationProps) {
  const pathname = usePathname();
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isHydrated) {
    return <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50",
      className
    )} aria-hidden="true" />;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50",
      className
    )}>
      <div className="grid grid-cols-4 gap-1 p-2">
        {navigation.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-2 py-2 text-xs font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}