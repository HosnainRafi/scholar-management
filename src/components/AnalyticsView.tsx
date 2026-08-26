import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertCircle, 
  Building2, 
  Users 
} from 'lucide-react';
import { ProfessorLead } from '../types';
import { calculateReminderInfo } from '../utils/reminderUtils';

interface AnalyticsViewProps {
  leads: ProfessorLead[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ leads }) => {
  const total = leads.length;
  const mailed = leads.filter(l => l.isMailed).length;
  const replied = leads.filter(l => l.isReplied).length;
  const awaitingReply = leads.filter(l => l.isMailed && !l.isReplied).length;
  
  const overdueCount = leads.filter(l => {
    if (!l.isMailed || l.isReplied) return false;
    const info = calculateReminderInfo(l);
    return info.isOverdue || info.isDueToday;
  }).length;

  const responseRate = mailed > 0 ? ((replied / mailed) * 100).toFixed(1) : '0';
  const contactedRate = total > 0 ? ((mailed / total) * 100).toFixed(1) : '0';

  // University breakdown
  const uniStats = React.useMemo(() => {
    const map = new Map<string, { total: number; mailed: number; replied: number }>();
    leads.forEach(l => {
      const u = l.university || 'Other';
      if (!map.has(u)) {
        map.set(u, { total: 0, mailed: 0, replied: 0 });
      }
      const entry = map.get(u)!;
      entry.total += 1;
      if (l.isMailed) entry.mailed += 1;
      if (l.isReplied) entry.replied += 1;
    });

    return Array.from(map.entries())
      .map(([university, stats]) => ({
        university,
        ...stats,
        rate: stats.mailed > 0 ? Math.round((stats.replied / stats.mailed) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [leads]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Outreach Funnel & Performance Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key metrics, response conversion ratios, and institutional outreach velocity
          </p>
        </div>

        {/* Funnel Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>1. Total Leads</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{total}</p>
            <p className="text-[11px] text-slate-500 mt-1">Cataloged across 25+ universities</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div className="bg-indigo-600 h-1.5 rounded-full w-full"></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>2. Contacted</span>
              <Send className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-indigo-600 mt-2">{mailed}</p>
            <p className="text-[11px] text-slate-500 mt-1">{contactedRate}% outreach progress</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, (mailed / Math.max(1, total)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>3. Awaiting / Overdue</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-2">{awaitingReply}</p>
            <p className="text-[11px] text-rose-600 font-semibold mt-1">{overdueCount} due for 7-day follow-up</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div 
                className="bg-amber-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, (awaitingReply / Math.max(1, mailed)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>4. Responses Received</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2">{replied}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">{responseRate}% overall conversion rate</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, (replied / Math.max(1, mailed)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* University Breakdown Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Institutional Performance Breakdown
              </h3>
              <p className="text-xs text-slate-500">Outreach and response tracking sorted by institution</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              {uniStats.length} Institutions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">University</th>
                  <th className="px-6 py-3 text-center">Total Faculty</th>
                  <th className="px-6 py-3 text-center">Emails Sent</th>
                  <th className="px-6 py-3 text-center">Replies Received</th>
                  <th className="px-6 py-3 min-w-[160px]">Response Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uniStats.map(stat => (
                  <tr key={stat.university} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-900 flex items-center space-x-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{stat.university}</span>
                    </td>
                    <td className="px-6 py-3 text-center text-slate-600 font-medium">{stat.total}</td>
                    <td className="px-6 py-3 text-center font-semibold text-indigo-600">{stat.mailed}</td>
                    <td className="px-6 py-3 text-center font-semibold text-emerald-600">{stat.replied}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${stat.rate}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-800 w-10 text-right">{stat.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
