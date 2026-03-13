import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/store/authContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Badge, EventStatusBadge, Avatar } from '@/components/ui';
import { eventsApi, assignmentsApi, surveysApi } from '@/api/client';
import type { Event, Assignment, Survey } from '@/types';
import { CalendarDays, ClipboardList, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: events } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => eventsApi.list().then(r => r.data),
  });

  const { data: myAssignments } = useQuery<Assignment[]>({
    queryKey: ['my-assignments'],
    queryFn: () => assignmentsApi.my().then(r => r.data),
    enabled: user?.role === 'volunteer',
  });

  const { data: currentSurvey } = useQuery<Survey | null>({
    queryKey: ['current-survey'],
    queryFn: () => surveysApi.currentWeek().then(r => r.data),
  });

  const activeEvents = events?.filter(e => e.status === 'active' || e.status === 'scheduled') ?? [];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar src={user?.photo_path} name={user?.full_name ?? ''} size="lg" />
          <div>
            <h1 className="font-display text-3xl">Welcome back, {user?.full_name?.split(' ')[0]}</h1>
            <p className="text-slate-400 text-sm mt-0.5">Here's what's happening this week</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-brand-600/20">
              <CalendarDays size={20} className="text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{activeEvents.length}</p>
              <p className="text-xs text-slate-500">Upcoming Events</p>
            </div>
          </Card>
          {user?.role === 'volunteer' && (
            <Card className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-600/20">
                <ClipboardList size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{myAssignments?.length ?? 0}</p>
                <p className="text-xs text-slate-500">My Assignments</p>
              </div>
            </Card>
          )}
          <Card className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-amber-600/20">
              <FileText size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{currentSurvey ? '✓' : '—'}</p>
              <p className="text-xs text-slate-500">Weekly Survey</p>
            </div>
          </Card>
        </div>

        {/* Survey reminder */}
        {!currentSurvey && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Weekly survey not submitted</p>
                <p className="text-xs text-slate-400">Help admins plan your schedule — fill it out before the week starts.</p>
              </div>
              <a href="/survey" className="ml-auto shrink-0 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Take Survey →
              </a>
            </div>
          </Card>
        )}

        {/* Upcoming Events */}
        <div>
          <h2 className="font-display text-xl mb-4">Upcoming Events</h2>
          {activeEvents.length === 0 ? (
            <Card><p className="text-slate-500 text-sm text-center py-4">No upcoming events.</p></Card>
          ) : (
            <div className="space-y-3">
              {activeEvents.slice(0, 5).map(event => (
                <Card key={event.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">{event.name}</span>
                      <EventStatusBadge status={event.status} />
                      <Badge>{event.show_type}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {event.location}
                      {event.event_date && ` · ${format(new Date(event.event_date), 'MMM d, yyyy h:mm a')}`}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{event.assignments.length} assignments</span>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}