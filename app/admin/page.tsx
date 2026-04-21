"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminPage() {
  const { isAuthenticated, role } = useUserStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);

  if (!isMounted || !isAuthenticated) {
    return null; // Prevents flash and waits for hydration
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-[100dvh] bg-neutral-950 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-900/50 bg-neutral-900 text-red-500 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center mb-4 border border-red-900">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-500">Access Denied</CardTitle>
            <CardDescription className="text-red-400">
              You do not have the required administrative privileges to view this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors border border-neutral-700"
            >
              Return Home
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-neutral-950 text-neutral-100 flex flex-col p-4 md:p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-neutral-400">
            Manage your Brain Ring platform data and system configurations.
          </p>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}
