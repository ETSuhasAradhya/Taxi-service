import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Car, Lock, Mail, Shield, User, Navigation, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      const role = res.user.role;
      const destination =
        location.state?.from?.pathname ||
        (role === 'admin' ? '/admin' : role === 'driver' ? '/driver' : '/customer');
      navigate(destination, { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20 group-hover:scale-105 transition-transform">
            <Car className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-950">CityCab</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-amber-600 hover:text-amber-500">
            register a new customer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10">
          {/* Quick Fill Demo Credentials Bar */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Demo Quick-Fill Accounts
            </div>
            <p className="text-[11px] text-slate-600 mb-3">
              Password for all: <code className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-amber-300">Password123!</code>
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@taxiservice.com', 'admin')}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-100/50 font-semibold text-slate-800 transition-all text-left"
              >
                <Shield className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">Admin Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('rahul.sharma@example.com', 'customer')}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-100/50 font-semibold text-slate-800 transition-all text-left"
              >
                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Customer 1</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('priya.patel@example.com', 'customer')}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-100/50 font-semibold text-slate-800 transition-all text-left"
              >
                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Customer 2</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('suresh.driver@example.com', 'driver')}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-100/50 font-semibold text-slate-800 transition-all text-left"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">Driver 1</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="e.g. admin@taxiservice.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
