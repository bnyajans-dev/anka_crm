import { useTranslation } from 'react-i18next';
import { 
  Globe,
  User,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import NotificationsPopover from '../NotificationsPopover';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
        case 'system_admin': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
        case 'admin': return 'bg-red-100 text-red-800 hover:bg-red-200';
        case 'manager': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        case 'sales': return 'bg-green-100 text-green-800 hover:bg-green-200';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
        case 'system_admin': return 'Sistem Yönetici';
        case 'admin': return 'Yönetici';
        case 'manager': return 'Ekip Lideri';
        case 'sales': return 'Satış';
        default: return role;
    }
  };

  return (
    <header className="h-16 bg-background border-b border-border px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold tracking-tight hidden md:block">
          {t('common.dashboard')}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => changeLanguage('tr')}>
              Türkçe
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('en')}>
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <NotificationsPopover />

        <div className="w-px h-6 bg-border mx-1" />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent hover:text-accent-foreground rounded-full h-auto py-1">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-sm font-medium leading-none">{user?.name}</span>
                {user?.role && (
                    <Badge variant="outline" className={`text-[10px] px-1 py-0 mt-1 border-0 ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                    </Badge>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={logout}>
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
