import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileQuestion, Gamepad2 } from "lucide-react";
import { api } from '@/lib/api';
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewTab() {
  const [stats, setStats] = useState({ users: 0, questions: 0, matches: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const [usersRes, questionsRes] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/questions')
        ]);
        
        if (active) {
          setStats({
            users: usersRes.data.data?.length || 0,
            questions: questionsRes.data.data?.length || 0,
            matches: 0 // Placeholders for later backend hookup
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load stats", error);
        if (active) setLoading(false);
      }
    };
    fetchStats();
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black tracking-tight text-white uppercase tracking-widest">Statistika</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Foydalanuvchilar" icon={<Users className="h-4 w-4 text-neutral-400" />} value={stats.users} loading={loading} />
        <StatCard title="Savollar" icon={<FileQuestion className="h-4 w-4 text-neutral-400" />} value={stats.questions} loading={loading} />
        <StatCard title="O'yinlar" icon={<Gamepad2 className="h-4 w-4 text-neutral-400" />} value={stats.matches} loading={loading} />
      </div>
    </div>
  );
}

function StatCard({ title, icon, value, loading }: { title: string, icon: React.ReactNode, value: number, loading: boolean }) {
  return (
    <Card className="bg-neutral-950 border-neutral-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-200">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16 bg-neutral-800" />
        ) : (
          <div className="text-3xl font-bold text-white">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
