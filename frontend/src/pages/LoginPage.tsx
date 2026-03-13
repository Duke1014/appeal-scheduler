import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/store/authContext';
import { authApi } from '@/api/client';
import { Button, Input, Card } from '@/components/ui';
import type { TokenResponse } from '@/types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      const res = data as TokenResponse;
      login(res.access_token, res.user);
      navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl text-white mb-1">Appeal</h1>
          <p className="text-slate-400 text-sm">Sign in to your account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email" label="Email" type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              id="password" label="Password" type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign In
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}