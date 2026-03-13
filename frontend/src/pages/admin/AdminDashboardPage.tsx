import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, EventStatusBadge, RoleBadge } from '@/components/ui';
import { eventsApi, usersApi, surveysApi } from '@/api/client';
import type { Event, User, Survey } from '@/types';
import { Users, CalendarDays, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const { data: events } = useQuery<Event[]>({ queryKey: ['events'], queryFn: () => eventsApi.list().then(r => r.data) });
  const { data: users } = useQuery<User[]>({ queryKey: ['users'], queryFn: () => usersApi.list().then(r => r.data) });
  const { data: surveysWithNotes } = useQuery<Survey[]>({ queryKey: ['surveys-notes'], queryFn: () => surveysApi.withNotes().then(r => r.data) });

  const volunteers = users?.filter(u => u.role === 'volunteer') ?? [];
  const activeEvents = events?.filter(e => e.status === 'active') ?? [];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Overview of the current week</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <CalendarDays size={18} />, value: events?.length ?? 0, label: 'Total Events', color: 'brand' },
            { icon: <CalendarDays size={18} />, value: activeEvents.length, label: 'Active Now', color: 'emerald' },
            { icon: <Users size={18} />, value: volunteers.length, label: 'Volunteers', color: 'purple' },
            { icon: <MessageSquare size={18} />, value: surveysWithNotes?.length ?? 0, label: 'Surveys w/ Notes', color: 'amber' },
          ].map(({ icon, value, label, color }) => (
            <Card key={label} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${color}-600/20 text-${color}-400`}>{icon}</div>
              <div>
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <div>
            <h2 className="font-display text-xl mb-3">Recent Events</h2>
            <div className="space-y-2">
              {events?.slice(0, 5).map(event => (
                <Card key={event.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{event.name}</p>
                    <p className="text-xs text-slate-500">
                      {event.location} · {event.show_type}
                      {event.event_date && ` · ${format(new Date(event.event_date), 'MMM d')}`}
                    </p>
                  </div>
                  <EventStatusBadge status={event.status} />
                </Card>
              )) ?? <Card><p className="text-slate-500 text-sm">No events yet.</p></Card>}
            </div>
          </div>

          {/* Surveys with notes */}
          <div>
            <h2 className="font-display text-xl mb-3">Surveys with Notes</h2>
            <div className="space-y-2">
              {surveysWithNotes?.slice(0, 5).map(s => (
                <Card key={s.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white">{s.user.full_name}</p>
                    <RoleBadge role={s.user.role} />
                    <span className="text-xs text-slate-500 ml-auto">{format(new Date(s.week_start), 'MMM d')}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{s.notes}</p>
                </Card>
              )) ?? <Card><p className="text-slate-500 text-sm">No surveys with notes.</p></Card>}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}