import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/store/authContext';
import { authApi } from '@/api/client';
import { Button, Input, Card } from '@/components/ui';
import type { TokenResponse } from '@/types';

export default function RegisterPage() {
  const [fields, setFields] = useState({ email: '', password: '', full_name: '', registration_code: '' });
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      const { data } = await authApi.register(fd);
      const res = data as TokenResponse;
      login(res.access_token, res.user);
      navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl text-white mb-1">Join Appeal</h1>
          <p className="text-slate-400 text-sm">Create your account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="full_name" label="Full Name" required value={fields.full_name} onChange={set('full_name')} placeholder="Jane Smith" />
            <Input id="email" label="Email" type="email" required value={fields.email} onChange={set('email')} placeholder="you@example.com" />
            <Input id="password" label="Password" type="password" required value={fields.password} onChange={set('password')} placeholder="Minimum 8 characters" minLength={8} />
            <Input id="registration_code" label="Registration Code" required value={fields.registration_code} onChange={set('registration_code')} placeholder="Provided by your admin" />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Profile Photo <span className="text-slate-500">(optional)</span></label>
              <input
                type="file" accept="image/jpeg,image/png,image/webp"
                onChange={e => setPhoto(e.target.files?.[0] ?? null)}
                className="text-sm text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-600 file:text-white file:text-sm file:cursor-pointer hover:file:bg-brand-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Create Account
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}