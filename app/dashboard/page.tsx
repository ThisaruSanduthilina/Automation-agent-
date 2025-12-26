'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasHydrated } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for store to hydrate before checking auth
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadDashboard();
  }, [isAuthenticated, router, hasHydrated]);

  const loadDashboard = async () => {
    try {
      const data = await apiClient.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Show loading while store is hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Smart Energy Management</h1>
            <p className="text-sm text-gray-400">Welcome, {user?.full_name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-200 border border-blue-700">
              {user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Chat Button */}
        <div className="mb-6">
          <a
            href="/chat"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
          >
            ← Back to Chat
          </a>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Battery Card */}
            <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Battery Charge</p>
                  <p className="text-3xl font-bold text-green-400">
                    {dashboardData?.battery_charge?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="text-4xl">🔋</div>
              </div>
            </div>

            {/* Solar Production Card */}
            <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Solar Production</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {dashboardData?.solar_production?.toFixed(1) || 0} kW
                  </p>
                </div>
                <div className="text-4xl">☀️</div>
              </div>
            </div>

            {/* Consumption Card */}
            <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Consumption</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {dashboardData?.total_consumption?.toFixed(1) || 0} kW
                  </p>
                </div>
                <div className="text-4xl">⚡</div>
              </div>
            </div>

            {/* Savings Card */}
            <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Cost Savings</p>
                  <p className="text-3xl font-bold text-green-400">
                    ${dashboardData?.cost_savings?.toFixed(2) || 0}
                  </p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-blue-700 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
              <p className="font-medium text-white">💡 Control Lights</p>
              <p className="text-sm text-gray-400">Manage lighting in all zones</p>
            </button>
            <button className="p-4 border-2 border-green-700 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
              <p className="font-medium text-white">📊 View Analytics</p>
              <p className="text-sm text-gray-400">Energy consumption reports</p>
            </button>
            <button className="p-4 border-2 border-yellow-700 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
              <p className="font-medium text-white">🔧 Report Issue</p>
              <p className="text-sm text-gray-400">Submit electrical complaints</p>
            </button>
          </div>
        </div>

        {/* API Info */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-green-400 mb-2">✅ System Connected</h3>
          <p className="text-sm text-gray-400">
            Backend API: <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}</code>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Status: <span className="font-medium text-green-400">Online and Running</span>
          </p>
        </div>
      </main>
    </div>
  );
}
