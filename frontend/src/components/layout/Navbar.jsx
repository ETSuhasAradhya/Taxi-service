import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, LogOut, User, Shield, Compass, Navigation } from 'lucide-react';
import Button from '../common/Button';

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20 group-hover:scale-105 transition-transform">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-950">CityCab</span>
              <span className="rounded bg-slate-900 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider text-amber-400">DBMS</span>
            </div>
            <p className="text-[10px] font-medium text-slate-500">Taxi Service System</p>
          </div>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Role Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/60 text-xs">
                {role === 'admin' && <Shield className="w-3.5 h-3.5 text-rose-600" />}
                {role === 'driver' && <Navigation className="w-3.5 h-3.5 text-sky-600" />}
                {role === 'customer' && <User className="w-3.5 h-3.5 text-emerald-600" />}
                <span className="font-semibold text-slate-800 capitalize">{role}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600 max-w-[120px] truncate">{user?.full_name || user?.email}</span>
              </div>

              {/* Quick Link to Portal */}
              {role === 'admin' && (
                <Link to="/admin/sql-explorer">
                  <Button variant="outline" size="sm" icon={Compass}>
                    SQL Explorer
                  </Button>
                </Link>
              )}

              <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
