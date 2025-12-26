'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    }
  };

  const handleTestLogin = async (testEmail: string, testPassword: string) => {
    setError('');
    try {
      await login(testEmail, testPassword);
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Orbs */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '80px',
        width: '400px',
        height: '400px',
        background: 'rgba(59, 130, 246, 0.3)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 3s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '80px',
        right: '80px',
        width: '400px',
        height: '400px',
        background: 'rgba(168, 85, 247, 0.3)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 4s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        background: 'rgba(34, 211, 238, 0.15)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        animation: 'pulse 5s ease-in-out infinite'
      }}></div>

      {/* Login Card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{
          background: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 60px rgba(100, 100, 100, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '40px',
          boxSizing: 'border-box'
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(34, 211, 238, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)',
              marginBottom: '20px',
              transform: 'translateY(0)',
              transition: 'transform 0.3s ease'
            }}>
              <svg style={{ width: '48px', height: '48px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #ffffff 0%, #bfdbfe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              Smart Energy
            </h1>
            <p style={{ color: '#dbeafe', fontSize: '14px', fontWeight: '500' }}>
              Management System
            </p>
            <p style={{ color: 'rgba(219, 234, 254, 0.7)', fontSize: '12px', marginTop: '4px' }}>
              Sign in to your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(248, 113, 113, 0.5)',
              color: '#fecaca',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#dbeafe',
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <svg style={{ width: '18px', height: '18px', color: '#93c5fd' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 44px',
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
                  onFocus={(e) => {
                    e.target.style.borderColor = '#22d3ee';
                    e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 211, 238, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#dbeafe',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <svg style={{ width: '18px', height: '18px', color: '#93c5fd' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 44px',
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
                  onFocus={(e) => {
                    e.target.style.borderColor = '#22d3ee';
                    e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 211, 238, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
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
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 255, 255, 0.1)', e.currentTarget.style.background = 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)', e.currentTarget.style.background = 'linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%)')}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Test Login Buttons */}
          <div style={{ marginTop: '20px' }}>
            <p style={{
              textAlign: 'center',
              fontSize: '12px',
              color: 'rgba(219, 234, 254, 0.6)',
              marginBottom: '12px',
              fontWeight: '500'
            }}>
              Quick Test Login
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleTestLogin('admin@example.com', 'admin123')}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '10px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 16px rgba(168, 85, 247, 0.3)', e.currentTarget.style.background = 'linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)', e.currentTarget.style.background = 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)')}
              >
                Test Admin
              </button>
              <button
                type="button"
                onClick={() => handleTestLogin('user@example.com', 'user12345')}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.3)', e.currentTarget.style.background = 'linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)', e.currentTarget.style.background = 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)')}
              >
                Test User
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{ color: 'rgba(219, 234, 254, 0.7)', fontSize: '14px' }}>
              Don't have an account?{' '}
              <Link
                href="/register"
                style={{
                  color: '#67e8f9',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Version */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(219, 234, 254, 0.4)' }}>
              Smart Energy Management System v1.0.0
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
