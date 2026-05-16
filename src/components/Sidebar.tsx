import { NavLink } from "react-router-dom";
import { Github, Info, LayoutDashboard, Package, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const links: NavItem[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/packages", label: "Packages", icon: Package },
  { to: "/about", label: "About Me", icon: Info },
];

export function Sidebar({ open, onClose }: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-zinc-950/95 backdrop-blur border-r border-zinc-900 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className='h-16 flex items-center justify-between px-5 border-b border-zinc-900'>
          <div className='flex items-center gap-2.5'>
            <img
              src='/npm.svg'
              alt='npm'
              width={32}
              height={32}
              className='w-8 h-8 rounded-lg shadow-lg shadow-[#CB3837]/25'
            />
            <div className='leading-tight'>
              <div className='text-sm font-semibold text-zinc-100'>NPM Hub</div>
              <div className='text-[10px] uppercase tracking-wider text-zinc-500'>
                dashboard
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='lg:hidden p-1 text-zinc-500 hover:text-zinc-100'
            aria-label='Close sidebar'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <nav className='p-3 space-y-1'>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-500/20"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                }`
              }
            >
              <l.icon className='w-4 h-4' />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-900'>
          <a
            href='https://github.com/NPM-Packages-Modules'
            target='_blank'
            rel='noreferrer'
            className='flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200'
          >
            <Github className='w-3.5 h-3.5' />
            <span className='truncate'>NPM-Packages-Modules</span>
          </a>
        </div>
      </aside>
    </>
  );
}
