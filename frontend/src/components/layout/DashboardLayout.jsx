import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  BookOpen,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ClipboardList,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  ChevronRight,
  Search,
  CalendarDays,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFestival } from '../../context/FestivalContext';
import { managementRoles } from '../../utils/format';
import Avatar from '../Avatar';
import Logo from '../Logo';
import ThemeSwitcher from '../ThemeSwitcher';
import Modal from '../Modal';

const links = [
  ['/home', 'Overview', LayoutDashboard],
  ['/members', 'Committee & volunteers', Users],
  ['/collections', 'Collections', Wallet],
  ['/expenses', 'Expense ledger', BookOpen],
  ['/planning', 'Festival budgets', ClipboardList],
  ['/audit', 'Audit trail', ShieldCheck],
];
export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { year, setYear } = useFestival();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('gy_sidebar') === 'collapsed';
    } catch {
      return false;
    }
  });
  const [leaving, setLeaving] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const sidebar = useRef(null);
  const menuButton = useRef(null);
  const main = useRef(null);
  const location = useLocation();
  const management = managementRoles.includes(user.role);
  const navigation = links.filter(([path]) => path === '/home' || management);
  const secondary = [
    ...(user.role === 'admin' ? [['/users', 'Access management', ShieldCheck]] : []),
    ['/profile', 'My profile & settings', Settings2],
  ];
  const title =
    [...navigation, ...secondary].find(([path]) => path === location.pathname)?.[1] || 'My profile';
  useEffect(() => {
    document.title = `${title} · Ganesh Youth`;
  }, [title]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const mainElement = main.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mainElement?.setAttribute('inert', '');
    sidebar.current?.querySelector('.mobile-close')?.focus();
    const keydown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = [...sidebar.current.querySelectorAll('a,button:not(:disabled)')].filter(
        (node) => node.getClientRects().length,
      );
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const resize = () => {
      if (window.innerWidth > 850) setOpen(false);
    };
    document.addEventListener('keydown', keydown);
    window.addEventListener('resize', resize);
    return () => {
      document.body.style.overflow = overflow;
      mainElement?.removeAttribute('inert');
      document.removeEventListener('keydown', keydown);
      window.removeEventListener('resize', resize);
      previous?.focus();
    };
  }, [open]);
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    try {
      localStorage.setItem('gy_sidebar', collapsed ? 'expanded' : 'collapsed');
    } catch {
      /* optional preference */
    }
  };
  const signOut = async () => {
    setLeaving(true);
    try {
      await logout();
    } catch {
      /* AuthProvider always clears the local session. */
    } finally {
      setLeaving(false);
    }
  };
  const renderLink = ([path, label, Icon]) => (
    <NavLink
      to={path}
      key={path}
      title={collapsed ? label : undefined}
      aria-label={label}
      onClick={() => setOpen(false)}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
    >
      <Icon size={19} />
      <span>{label}</span>
    </NavLink>
  );
  return (
    <div className={`app-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {open && (
        <button
          className="nav-scrim"
          aria-label="Dismiss navigation"
          onClick={() => setOpen(false)}
          tabIndex={-1}
        />
      )}
      <aside
        ref={sidebar}
        id="workspace-navigation"
        className={`sidebar ${open ? 'is-open' : ''}`}
        aria-label="Workspace navigation"
        role={open ? 'dialog' : undefined}
        aria-modal={open ? true : undefined}
      >
        <Link
          className="sidebar-brand"
          aria-label="Ganesh Youth home"
          to="/home"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </Link>
        <button
          className="mobile-close icon-button"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          <X size={19} />
        </button>
        <div className="workspace-label">
          <span className="live-dot" />
          Festival workspace<span>{year}</span>
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav aria-label="Main navigation">{navigation.map(renderLink)}</nav>
        <div className="nav-secondary">
          <p className="nav-caption">MANAGE</p>
          <nav aria-label="Account navigation">{secondary.map(renderLink)}</nav>
        </div>
        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <Heart size={19} />
          <strong>
            A little contribution.
            <br />A lasting difference.
          </strong>
          <p>One community. One celebration. Made possible by all of us.</p>
          <Link to={management ? '/collections' : '/home'} onClick={() => setOpen(false)}>
            Our contributions
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="sidebar-account">
          <Link to="/profile" onClick={() => setOpen(false)}>
            <Avatar user={user} />
            <span>
              <strong>{user.name}</strong>
              <small>{user.authority}</small>
            </span>
          </Link>
          <button
            className="icon-button"
            onClick={signOut}
            disabled={leaving}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell" ref={main}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              ref={menuButton}
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              aria-expanded={open}
              aria-controls="workspace-navigation"
              onClick={() => setOpen(true)}
            >
              <Menu size={21} />
            </button>
            <button
              className="desktop-collapse icon-button"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              onClick={toggleSidebar}
            >
              {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            </button>
            <Link to="/home" className="mobile-brand" aria-label="Ganesh Youth home">
              <Logo variant="mobile" />
            </Link>
            <span>Workspace</span>
            <span>
              <ChevronRight size={13} />
            </span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="desktop-date">
              {new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <button
              className="icon-button"
              aria-label="Search pages"
              title="Search pages"
              onClick={() => {
                setQuery('');
                setSearchOpen(true);
              }}
            >
              <Search size={18} />
            </button>
            <ThemeSwitcher />
            <span className="topbar-divider" />
            <Link className="header-account" to="/profile" aria-label="Open my profile">
              <Avatar user={user} />
              <span className="header-account-copy">
                <strong>{user.name.split(' ')[0]}</strong>
                <small>{user.role}</small>
              </span>
            </Link>
          </div>
        </header>
        <main id="main-content" className="main-content">
          <div className="workspace-toolbar">
            <span>
              <span className="small-dot" />
              YOUR COMMUNITY, CONNECTED
            </span>
            <label>
              <CalendarDays size={14} />
              <span className="hidden sm:inline">Festival year</span>
              <select
                aria-label="Festival year"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => new Date().getFullYear() + 2 - i).map(
                  (value) => (
                    <option key={value}>{value}</option>
                  ),
                )}
              </select>
            </label>
          </div>
          <div key={location.pathname} className="page-transition">
            {children}
          </div>
          <footer className="workspace-footer">
            <Heart size={13} />
            <span>Ganesh Youth · Together, we make it happen.</span>
            <span>January – December {year}</span>
          </footer>
        </main>
      </div>
      {searchOpen && (
        <Modal title="Find your way" onClose={() => setSearchOpen(false)}>
          <label className="search-field w-full">
            <Search size={18} />
            <input
              autoFocus
              className="w-full"
              aria-label="Search workspace pages"
              placeholder="Search pages…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <nav className="mt-4 grid gap-1" aria-label="Search results">
            {[...navigation, ...secondary]
              .filter(([, label]) => label.toLowerCase().includes(query.toLowerCase()))
              .map(([path, label, Icon]) => (
                <Link
                  className="nav-item"
                  key={path}
                  to={path}
                  onClick={() => setSearchOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  <ChevronRight size={14} className="ml-auto" />
                </Link>
              ))}
          </nav>
          {![...navigation, ...secondary].some(([, label]) =>
            label.toLowerCase().includes(query.toLowerCase()),
          ) && <p className="fine-print p-4">No pages match “{query}”. Try another name.</p>}
        </Modal>
      )}
    </div>
  );
}
