import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-4 py-2 text-sm font-medium transition-all',
    isActive
      ? 'bg-teal/10 text-navy'
      : 'text-navy/70 hover:bg-teal/5 hover:text-teal',
  ].join(' ')

export default function AppShell() {
  const { session, userEmail, loading, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-navy/10 bg-cream/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div>
            <p className="font-display text-xl font-bold text-navy">Dr. Data Pulse</p>
            <p className="hidden text-xs text-navy/50 sm:block">
              Decision intelligence from every interaction
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="flex items-center gap-1">
              <NavLink to="/" className={linkClass} end>
                Home
              </NavLink>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
            </nav>
            {!loading && session ? (
              <div className="ml-1 flex items-center gap-2 border-l border-navy/10 pl-2 sm:ml-2 sm:pl-3">
                {userEmail ? (
                  <span className="hidden max-w-[10rem] truncate text-xs text-navy/50 sm:inline">
                    {userEmail}
                  </span>
                ) : null}
                <button type="button" onClick={handleSignOut} className="btn-navy !px-3 !py-2 text-xs">
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
