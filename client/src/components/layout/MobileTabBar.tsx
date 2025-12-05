import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, MapPin, FileText, Briefcase, User } from 'lucide-react';

const tabs = [
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/visits', icon: MapPin, labelKey: 'nav.visits' },
  { path: '/offers', icon: FileText, labelKey: 'nav.offers' },
  { path: '/sales', icon: Briefcase, labelKey: 'nav.sales' },
  { path: '/profile', icon: User, labelKey: 'common.profile' },
];

export function MobileTabBar() {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border">
      <div className="flex justify-around items-center h-16 px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center flex-1 py-2 relative"
              data-testid={`tab-${tab.path.slice(1) || 'dashboard'}`}
            >
              {active && (
                <div className="absolute inset-x-2 top-0 h-0.5 bg-primary rounded-full" />
              )}
              <Icon 
                className={`h-5 w-5 mb-0.5 transition-colors ${
                  active 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`} 
              />
              <span 
                className={`text-[10px] font-medium transition-colors ${
                  active 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
