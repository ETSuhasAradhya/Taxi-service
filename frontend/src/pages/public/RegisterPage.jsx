import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Car, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.full_name || !formData.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    const res = await register(formData);
    setIsLoading(false);

    if (res.success) {
      navigate('/customer');
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
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create your Rider Account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name *"
              name="full_name"
              icon={User}
              placeholder="e.g. Rahul Sharma"
              value={formData.full_name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email Address *"
              name="email"
              type="email"
              icon={Mail}
              placeholder="e.g. rahul@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Phone Number *"
              name="phone"
              type="tel"
              icon={Phone}
              placeholder="e.g. +91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <Input
              label="Default Address / Neighborhood"
              name="address"
              icon={MapPin}
              placeholder="e.g. Indiranagar, Bangalore"
              value={formData.address}
              onChange={handleChange}
            />

            <Input
              label="Password (min 6 characters) *"
              name="password"
              type="password"
              icon={Lock}
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
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
                Create Account & Book
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
