import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Button, Select } from '@/components/ui';
import { surveysApi } from '@/api/client';
import { AVAILABILITY_SLOTS } from '@/types';
import type { Survey } from '@/types';
import { format, startOfWeek } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';

const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday

export default function SurveyPage() {
  const qc = useQueryClient();
  const [slots, setSlots] = useState<Set<string>>(new Set());
  const [location, setLocation] = useState<string>('');
  const [extras, setExtras] = useState(0);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: existing } = useQuery<Survey | null>({
    queryKey: ['current-survey'],
    queryFn: () => surveysApi.currentWeek().then(r => r.data),
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => surveysApi.submit({
      week_start: weekStart.toISOString(),
      available_slots: Array.from(slots),
      preferred_location: location || undefined,
      additional_volunteers: extras,
      notes: notes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['current-survey'] });
      setSuccess(true);
    },
  });

  const toggleSlot = (key: string) => {
    setSlots(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  if (existing) {
    const existingSlots = existing.available_slots?.split(',') ?? [];
    return (
      <AppLayout>
        <div className="max-w-lg space-y-6">
          <h1 className="font-display text-3xl">Weekly Survey</h1>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 size={22} className="text-emerald-400" />
              <div>
                <p className="font-medium text-white">Survey submitted</p>
                <p className="text-xs text-slate-400">Week of {format(weekStart, 'MMM d, yyyy')}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div><span className="text-slate-500">Available slots: </span>{existingSlots.join(', ') || '—'}</div>
              <div><span className="text-slate-500">Location: </span>{existing.preferred_location ?? '—'}</div>
              <div><span className="text-slate-500">Extra volunteers: </span>{existing.additional_volunteers}</div>
              {existing.notes && <div><span className="text-slate-500">Notes: </span>{existing.notes}</div>}
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (success) {
    return (
      <AppLayout>
        <Card className="max-w-md border-emerald-500/20 bg-emerald-500/5">
          <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-center text-white font-medium">Survey submitted!</p>
          <p className="text-center text-slate-400 text-sm mt-1">Your availability for the week has been recorded.</p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-3xl">Weekly Survey</h1>
          <p className="text-slate-400 text-sm mt-1">Week of {format(weekStart, 'MMMM d, yyyy')}</p>
        </div>

        <Card>
          <h2 className="font-medium text-white mb-4">When are you available?</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AVAILABILITY_SLOTS.map(slot => (
              <button
                key={slot.key}
                onClick={() => toggleSlot(slot.key)}
                className={`px-3 py-2 rounded-lg text-sm border transition-all duration-150 text-left ${
                  slots.has(slot.key)
                    ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <Select
              label="Where are you willing to volunteer?"
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              options={[
                { value: '', label: 'No preference' },
                { value: 'uptown', label: 'Uptown' },
                { value: 'downtown', label: 'Downtown' },
              ]}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                How many additional volunteers will you bring?
              </label>
              <input
                type="number" min={0} max={20} value={extras}
                onChange={e => setExtras(Number(e.target.value))}
                className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white w-28 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Notes for admin <span className="text-slate-500">(optional)</span></label>
            <textarea
              rows={4} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any special circumstances, requests, or information..."
              className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
        </Card>

        {error && (
          <p className="text-sm text-red-400">Failed to submit survey. Please try again.</p>
        )}

        <Button onClick={() => mutate()} loading={isPending} size="lg">
          Submit Survey
        </Button>
      </div>
    </AppLayout>
  );
}