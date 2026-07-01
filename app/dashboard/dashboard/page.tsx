'use client';
import { useQuery } from '@tanstack/react-query';
import { dimedApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Users, Calendar, Activity, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f97316', '#ef4444'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dimedApi.stats().then((r) => r.data),
    refetchInterval: 30_000,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
    </div>
  );

  const chartData = [
    { name: 'Dush', bemorlar: 12, navbatlar: 8 },
    { name: 'Sesh', bemorlar: 18, navbatlar: 15 },
    { name: 'Chor', bemorlar: 22, navbatlar: 20 },
    { name: 'Pay', bemorlar: 16, navbatlar: 14 },
    { name: 'Jum', bemorlar: 25, navbatlar: 22 },
    { name: 'Shan', bemorlar: 10, navbatlar: 8 },
    { name: 'Yak', bemorlar: 5, navbatlar: 3 },
  ];

  const pieData = [
    { name: 'Bajarilgan', value: stats?.totalAppointments - stats?.pendingAppointments || 60 },
    { name: 'Kutilmoqda', value: stats?.pendingAppointments || 40 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Xush kelibsiz, {user?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Bugungi tibbiy ko'rsatkichlar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Jami Bemorlar', value: stats?.totalPatients ?? 0, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50', change: '+12%' },
          { label: 'Bugungi Navbatlar', value: stats?.pendingAppointments ?? 0, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+5%' },
          { label: 'Jami Tahlillar', value: stats?.totalDiagnoses ?? 0, icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50', change: '+8%' },
          { label: 'Yuqori Xavf', value: stats?.highRiskDiagnoses ?? 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', change: '-3%' },
        ].map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm">{card.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{card.value.toLocaleString()}</p>
                <p className={`text-xs mt-1 ${card.change.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {card.change} o'tgan oyga nisbatan
                </p>
              </div>
              <div className={`p-3 ${card.bg} rounded-xl`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Haftalik statistika</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip />
              <Area type="monotone" dataKey="bemorlar" stroke="#0ea5e9" fill="#e0f2fe" name="Bemorlar" />
              <Area type="monotone" dataKey="navbatlar" stroke="#10b981" fill="#d1fae5" name="Navbatlar" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Navbat holati</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={4}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats?.recentAppointments?.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">So'nggi navbatlar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-5 py-3 text-left font-medium">Bemor</th>
                  <th className="px-5 py-3 text-left font-medium">Shifokor</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Vaqt</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAppointments.slice(0, 5).map((a: any) => (
                  <tr key={a.id} className="border-t border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-5 py-3 font-medium text-slate-800">{a.patientName || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{a.doctorName || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        a.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        a.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{a.status}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {a.scheduledAt ? new Date(a.scheduledAt).toLocaleString('uz-UZ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
