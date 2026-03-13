import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Badge, Avatar } from '@/components/ui';
import { assignmentsApi } from '@/api/client';
import type { Assignment } from '@/types';
import { Cpu, Users } from 'lucide-react';

export default function MyAssignmentsPage() {
  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ['my-assignments'],
    queryFn: () => assignmentsApi.my().then(r => r.data),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl">My Assignments</h1>
          <p className="text-slate-400 text-sm mt-1">Positions you've been assigned to by your admin</p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && assignments?.length === 0 && (
          <Card>
            <p className="text-slate-500 text-sm text-center py-8">No assignments yet. Check back after your admin schedules you.</p>
          </Card>
        )}

        <div className="space-y-4">
          {assignments?.map(a => (
            <Card key={a.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-white">{a.name}</h3>
                  {a.uses_tech_devices && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Cpu size={13} className="text-brand-400" />
                      <span className="text-xs text-brand-400">Requires technical devices</span>
                    </div>
                  )}
                </div>
              </div>

              {a.notes && (
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/8">
                  <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide">Notes</p>
                  <p className="text-sm text-slate-300 whitespace-pre-line">{a.notes}</p>
                </div>
              )}

              {a.volunteers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users size={14} className="text-slate-500" />
                    <p className="text-xs text-slate-500 uppercase tracking-wide">With you at this post</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.volunteers.map(v => (
                      <div key={v.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <Avatar src={v.photo_path} name={v.full_name} size="sm" />
                        <span className="text-sm text-white">{v.full_name}</span>
                        <Badge variant={v.role === 'employee' ? 'warning' : 'default'}>{v.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}