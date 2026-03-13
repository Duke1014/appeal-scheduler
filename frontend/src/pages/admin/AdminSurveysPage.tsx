import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Avatar, RoleBadge, Badge } from '@/components/ui';
import { surveysApi } from '@/api/client';
import type { Survey } from '@/types';
import { format } from 'date-fns';
import { MessageSquare, MapPin, Users } from 'lucide-react';

export default function AdminSurveysPage() {
  const [onlyNotes, setOnlyNotes] = useState(false);

  const { data: allSurveys = [], isLoading } = useQuery<Survey[]>({
    queryKey: ['admin-surveys'],
    queryFn: () => surveysApi.adminAll().then(r => r.data),
  });

  const { data: noteSurveys = [] } = useQuery<Survey[]>({
    queryKey: ['surveys-notes'],
    queryFn: () => surveysApi.withNotes().then(r => r.data),
  });

  const surveys = onlyNotes ? noteSurveys : allSurveys;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl">Surveys</h1>
            <p className="text-slate-400 text-sm mt-1">{surveys.length} submissions</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input type="checkbox" checked={onlyNotes} onChange={e => setOnlyNotes(e.target.checked)} className="w-4 h-4 rounded" />
              With notes only
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : surveys.length === 0 ? (
          <Card><p className="text-slate-500 text-sm text-center py-8">No surveys found.</p></Card>
        ) : (
          <div className="space-y-3">
            {surveys.map(s => {
              const slots = s.available_slots?.split(',').filter(Boolean) ?? [];
              return (
                <Card key={s.id}>
                  <div className="flex items-start gap-4">
                    <Avatar src={s.user.photo_path} name={s.user.full_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-white text-sm">{s.user.full_name}</p>
                        <RoleBadge role={s.user.role} />
                        <span className="text-xs text-slate-500 ml-auto">
                          Week of {format(new Date(s.week_start), 'MMM d, yyyy')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {/* Location */}
                        {s.preferred_location && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin size={13} className="text-brand-400" />
                            <span className="capitalize">{s.preferred_location}</span>
                          </div>
                        )}

                        {/* Extra volunteers */}
                        {s.additional_volunteers > 0 && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Users size={13} className="text-emerald-400" />
                            <span>+{s.additional_volunteers} extra volunteer{s.additional_volunteers !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>

                      {/* Availability slots */}
                      {slots.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {slots.map(slot => (
                            <Badge key={slot} variant="info">{slot.replace('_', ' ')}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {s.notes && (
                        <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MessageSquare size={13} className="text-amber-400" />
                            <span className="text-xs text-amber-400 font-medium">Admin Note</span>
                          </div>
                          <p className="text-sm text-slate-300">{s.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}