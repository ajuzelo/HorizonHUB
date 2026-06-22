import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, FileCode2, CheckSquare,
  FileText, Calculator, StickyNote, Wallet, Settings,
  ChevronLeft, ChevronRight, LogOut, User, Menu, MessageCircle, Activity
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import api from '@/services/api';

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
  profiles?: ('Profissional' | 'Pessoal')[];
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CreditCard, label: 'Contas a Pagar', path: '/accounts-payable', profiles: ['Profissional'] },
  { icon: FileCode2, label: 'Importador XML', path: '/xml-importer', profiles: ['Profissional'] },
  { icon: CheckSquare, label: 'Tarefas', path: '/tasks' },
  { icon: FileText, label: 'Central de NF', path: '/nf-central', profiles: ['Profissional'] },
  { icon: MessageCircle, label: 'WhatsApp', path: '/whatsapp' },
  { icon: Calculator, label: 'Calculadora', path: '/calculator' },
  { icon: StickyNote, label: 'Notas Rápidas', path: '/notes' },
  { icon: Wallet, label: 'Financeiro Pessoal', path: '/personal-finance', profiles: ['Pessoal'] },
];

export default function AppLayout() {
  const { user, profiles, activeProfileId, setActiveProfile, logout, settings, setSettings } = useAuthStore();
  const [collapsed, setCollapsed] = useState(settings?.sidebar_collapsed ?? false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    setSettings({ sidebar_collapsed: next });
  };

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    navigate('/login', { replace: true });
  };

  const handleProfileSwitch = async (profileId: number) => {
    setActiveProfile(profileId);
    try { await api.put('/auth/profile/active', { profile_id: profileId }); } catch {}
  };

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.profiles) return true;
    return item.profiles.includes(activeProfile?.nome as any);
  });

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]',
        collapsed && 'justify-center px-3'
      )}>
        <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 shadow-gold-sm">
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L3 8.5V20L14 26L25 20V8.5L14 2Z" stroke="#FFD700" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M14 2V26M3 8.5L25 20M25 8.5L3 20" stroke="#FFD700" strokeWidth="1" strokeOpacity="0.35" />
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary leading-tight">Horizon HUB</p>
            <p className="text-[10px] text-text-muted leading-tight">Adm. Pessoal</p>
          </div>
        )}
      </div>

      {/* Profile switcher */}
      {!collapsed && profiles.length > 1 && (
        <div className="px-3 pt-3 pb-1">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider px-1 mb-2">Perfil ativo</p>
          <div className="flex gap-1.5">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProfileSwitch(p.id)}
                className={cn(
                  'flex-1 text-xs font-medium py-1.5 rounded-lg border transition-all duration-150',
                  p.id === activeProfileId
                    ? 'bg-gold/10 text-gold border-gold/25 shadow-gold-sm'
                    : 'bg-bg-elevated text-text-secondary border-white/[0.06] hover:border-white/10 hover:text-text-primary'
                )}
              >
                {p.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider px-2 mb-2">Menu</p>
        )}
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'sidebar-item',
                collapsed && 'justify-center px-2',
                isActive && 'active'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={16} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/[0.06] p-2 space-y-0.5">
        <NavLink
          to="/logs"
          className={({ isActive }) =>
            cn('sidebar-item', collapsed && 'justify-center px-2', isActive && 'active')
          }
          title={collapsed ? 'Logs do Sistema' : undefined}
        >
          <Activity size={16} className="flex-shrink-0" />
          {!collapsed && <span>Logs do Sistema</span>}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn('sidebar-item', collapsed && 'justify-center px-2', isActive && 'active')
          }
          title={collapsed ? 'Configurações' : undefined}
        >
          <Settings size={16} className="flex-shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </NavLink>

        {/* User info */}
        <div className={cn(
          'flex items-center gap-2.5 px-2 py-2 rounded-lg',
          collapsed && 'justify-center'
        )}>
          <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-gold" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user?.nome}</p>
              <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Sair"
              className="text-text-muted hover:text-danger transition-colors p-1"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={handleLogout}
            className="sidebar-item w-full justify-center px-2 hover:text-danger"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-bg-surface border-r border-white/[0.06] transition-all duration-300 ease-in-out relative',
          collapsed ? 'w-[60px]' : 'w-[220px]'
        )}
      >
        {sidebarContent}

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapse}
          className={cn(
            'absolute top-[72px] -right-3 w-6 h-6 rounded-full',
            'bg-bg-elevated border border-white/[0.1] shadow-card',
            'flex items-center justify-center',
            'text-text-muted hover:text-text-primary hover:border-gold/30',
            'transition-all duration-150 z-10'
          )}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[220px] bg-bg-surface border-r border-white/[0.06] animate-slide-in-left">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-12 border-b border-white/[0.06] bg-bg-surface flex items-center px-4 gap-3 flex-shrink-0">
          <button
            className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>

          <div className="flex-1" />

          {/* Profile badge */}
          {activeProfile && (
            <span className="badge-gold text-[11px]">
              {activeProfile.nome}
            </span>
          )}

          <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center">
            <User size={13} className="text-gold" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
