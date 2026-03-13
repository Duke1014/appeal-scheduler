import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Button, Input, Select, Modal, EventStatusBadge, Badge } from '@/components/ui';
import { eventsApi } from '@/api/client';
import type { Event } from '@/types';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['scheduled','active','cancelled','completed','postponed'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
const SHOWTYPE_OPTIONS = [{ value: 'evening', label: 'Evening' }, { value: 'matinee', label: 'Matinee' }];

interface EventForm { name: string; show_type: string; location: string; status: string; event_date: string }
const emptyForm = (): EventForm => ({ name: '', show_type: 'evening', location: '', status: 'scheduled', event_date: '' });

export default function AdminEventsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm());

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => eventsApi.list().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => eventsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); setShowCreate(false); setForm(emptyForm()); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => eventsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => eventsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });

  const set = (k: keyof EventForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (isEdit = false) => {
    const payload = { ...form, event_date: form.event_date || undefined };
    if (isEdit && editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  };

  const openEdit = (event: Event) => {
    setEditing(event);
    setForm({
      name: event.name, show_type: event.show_type,
      location: event.location, status: event.status,
      event_date: event.event_date ? event.event_date.slice(0, 16) : '',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl">Events</h1>
            <p className="text-slate-400 text-sm mt-1">{events.length} total events</p>
          </div>
          <Button onClick={() => { setForm(emptyForm()); setShowCreate(true); }}>
            <Plus size={16} /> New Event
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <Card key={event.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-white text-sm">{event.name}</p>
                    <EventStatusBadge status={event.status} />
                    <Badge>{event.show_type}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {event.location}
                    {event.event_date && ` · ${format(new Date(event.event_date), 'MMM d, yyyy h:mm a')}`}
                    {` · ${event.assignments.length} assignments`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(event)}><Pencil size={14} /></Button>
                  <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete event?')) deleteMutation.mutate(event.id); }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={showCreate || !!editing}
        onClose={() => { setShowCreate(false); setEditing(null); }}
        title={editing ? 'Edit Event' : 'New Event'}
      >
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={set('name')} required />
          <Select label="Show Type" id="show_type" value={form.show_type} onChange={set('show_type')} options={SHOWTYPE_OPTIONS} />
          <Input label="Location" value={form.location} onChange={set('location')} required />
          <Select label="Status" id="status" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
          <Input label="Date & Time (optional)" type="datetime-local" value={form.event_date} onChange={set('event_date')} />
          <Button
            onClick={() => handleSubmit(!!editing)}
            loading={createMutation.isPending || updateMutation.isPending}
            className="w-full"
          >
            {editing ? 'Save Changes' : 'Create Event'}
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}