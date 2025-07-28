'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  User, 
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: BarChart3,
    description: 'Overview and analytics',
  },
  {
    name: 'Content',
    href: '/content',
    icon: FileText,
    description: 'Manage your content',
    badge: 'AI',
  },
  {
    name: 'Generate',
    href: '/content?tab=create',
    icon: PlusCircle,
    description: 'Create new content',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App preferences',
  },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-background border-r border-border z-50 transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg">AutoBlogger Pro</h1>
                <p className="text-xs text-muted-foreground">AI Content Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-6">
            <div className="px-6 mb-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Menu
              </h2>
            </div>
            
            <div className="px-3 space-y-1">
              {navigationItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Section */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User Account</p>
                <p className="text-xs text-muted-foreground truncate">user@example.com</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content spacer for desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}
