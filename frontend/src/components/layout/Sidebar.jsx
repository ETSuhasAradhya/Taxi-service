import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Car,
  BookmarkCheck,
  CreditCard,
  Star,
  DollarSign,
  BarChart3,
  Terminal,
  PlusCircle,
  Navigation,
  Clock
} from 'lucide-react';

export default function Sidebar() {
  const { role } = useAuth();

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/bookings', label: 'Bookings Dispatch', icon: BookmarkCheck },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/drivers', label: 'Drivers', icon: Navigation },
    { to: '/admin/vehicles', label: 'Fleet & Vehicles', icon: Car },
    { to: '/admin/fare-rates', label: 'Fare Rates', icon: DollarSign },
    { to: '/admin/payments', label: 'Payment Ledger', icon: CreditCard },
    { to: '/admin/reviews', label: 'Rider Reviews', icon: Star },
    { to: '/admin/reports', label: 'DBMS Reports', icon: BarChart3 },
    { to: '/admin/sql-explorer', label: 'SQL Query Explorer', icon: Terminal, highlight: true }
  ];

  const customerLinks = [
    { to: '/customer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/customer/book', label: 'Book a Taxi', icon: PlusCircle, highlight: true },
    { to: '/customer/bookings', label: 'My Rides', icon: Clock },
    { to: '/customer/payments', label: 'Payments', icon: CreditCard }
  ];

  const driverLinks = [
    { to: '/driver', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/driver/trips', label: 'Assigned Trips', icon: BookmarkCheck },
    { to: '/driver/reviews', label: 'Ratings & Reviews', icon: Star }
  ];

  const links =
    role === 'admin'
      ? adminLinks
      : role === 'driver'
      ? driverLinks
      : customerLinks;

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="sticky top-20 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {role} Menu
        </div>
        <nav className="space-y-1 mt-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? link.highlight
                        ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20'
                        : 'bg-slate-900 text-white shadow-sm'
                      : link.highlight
                      ? 'text-amber-700 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/50'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
