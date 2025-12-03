import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  School, 
  PlusCircle, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Briefcase,
  FileText,
  CreditCard,
  Calendar,
  Megaphone,
  Clock,
  Users,
  Shield,
  LineChart,
  FileSearch,
  Smartphone,
  Settings,
  Map
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import logo from '@assets/generated_images/minimalist_phoenix_logo_for_anka_travel.png';

export function Sidebar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      title: t('common.dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['admin', 'manager', 'sales']
    },
    {
      title: t('common.schools'),
      icon: School,
      href: '/schools',
      roles: ['admin', 'manager'] // Hidden for sales in menu, but accessible read-only
    },
    {
      title: t('common.visits'),
      icon: Briefcase,
      href: '/visits',
      roles: ['admin', 'manager', 'sales']
    },
    {
      title: t('common.offers'),
      icon: FileText,
      href: '/offers',
      roles: ['admin', 'manager', 'sales']
    },
    {
      title: t('common.sales'),
      icon: CreditCard,
      href: '/sales',
      roles: ['admin', 'manager', 'sales']
    },
    {
      title: t('common.leave_requests'),
      icon: Calendar,
      href: '/leave-requests',
      roles: ['admin', 'manager', 'sales']
    },
    {
      title: t('common.announcements'),
      icon: Megaphone,
      href: '/announcements',
      roles: ['admin', 'manager', 'sales']
    },
    {
      title: t('common.appointments'),
      icon: Clock,
      href: '/appointments',
      roles: ['admin', 'manager', 'sales']
    },
    // Target & Performance Section
    {
      title: 'Hedef Yönetimi',
      icon: LineChart,
      href: '/performance/targets',
      roles: ['admin', 'manager']
    },
    {
      title: t('performance.title'),
      icon: LineChart,
      href: '/performance/me',
      roles: ['sales']
    },
    {
      title: 'Performans Özeti',
      icon: Users,
      href: '/performance/users',
      roles: ['admin', 'manager']
    },
    {
      title: t('performance.commissions'),
      icon: CreditCard,
      href: '/commissions',
      roles: ['sales', 'manager', 'admin']
    },
    {
      title: t('audit.title'),
      icon: FileSearch,
      href: '/audit-logs',
      roles: ['admin']
    },
    // Admin Settings
    {
      title: 'Teklif Şablonu',
      icon: FileText,
      href: '/settings/offer-template',
      roles: ['admin']
    },
    {
      title: 'Mobile Preview',
      icon: Smartphone,
      href: '/m',
      roles: ['admin', 'manager', 'sales']
    },
    {
      title: t('common.users'),
      icon: Users,
      href: '/users',
      roles: ['admin']
    },
    {
      title: t('common.teams'),
      icon: Shield,
      href: '/teams',
      roles: ['admin']
    },
    // System Admin Section
    {
        title: 'Kullanıcı Yönetimi',
        icon: Users,
        href: '/system/users',
        roles: ['system_admin']
    },
    {
        title: 'Takım Yönetimi',
        icon: Shield,
        href: '/system/teams',
        roles: ['system_admin']
    },
    {
        title: 'Sistem Ayarları',
        icon: Settings,
        href: '/system/settings',
        roles: ['system_admin']
    },
    // Reports
    {
        title: 'Bölge Haritası',
        icon: Map,
        href: '/reports/map',
        roles: ['system_admin', 'admin', 'manager']
    }
  ];

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <img src={logo} alt="Anka Travel" className="h-8 w-8 rounded-md object-cover" />
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight text-sidebar-foreground truncate">
              Anka Travel
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems
          .filter(item => user && item.roles.includes(user.role))
          .map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link 
              key={item.href} 
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group relative",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "")} />
              {!collapsed && <span>{item.title}</span>}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.title}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-sidebar-border/50 space-y-2">
        <div className={cn("flex items-center gap-3 px-2 py-2 mb-2 text-sidebar-foreground/60 text-xs", collapsed && "justify-center")}>
           {!collapsed && (
             <div className="flex flex-col">
               <span className="font-medium text-sidebar-foreground">{user?.name}</span>
               <span className="uppercase text-[10px] tracking-wider">{user?.role}</span>
             </div>
           )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full flex justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{t('common.logout')}</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-8 mt-2 text-sidebar-foreground/50 hover:text-sidebar-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
