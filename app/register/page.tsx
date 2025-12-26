'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await register(email, password, fullName);
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
      <div className="p-8 rounded-lg shadow-2xl w-full max-w-md" style={{
        background: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#ffffff' }}>
          Create Account
        </h1>
        <p className="text-center mb-6" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Join Smart Energy Management</p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(248, 113, 113, 0.5)',
            color: '#fecaca',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1" style={{ color: '#dbeafe' }}>
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                boxSizing: 'border-box'
              }}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#dbeafe' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                boxSizing: 'border-box'
              }}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#dbeafe' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
              required
              minLength={8}
            />
            <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Must be at least 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '13px',
              background: 'linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%)',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => !isLoading && ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)', (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 20px rgba(255, 255, 255, 0.1)', (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)', (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)', (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%)')}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium" style={{ color: '#67e8f9', textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <p className="text-xs text-center" style={{ color: 'rgba(219, 234, 254, 0.4)' }}>
            Smart Energy Management System v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
