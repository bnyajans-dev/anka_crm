import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', href: '/m' },
    { icon: Briefcase, label: 'Visits', href: '/m/visits' },
    { icon: FileText, label: 'Offers', href: '/m/offers' },
    { icon: User, label: 'Profile', href: '/m/profile' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 flex items-center justify-around px-4 z-50 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/m' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              to={item.href} 
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive && "fill-current/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
