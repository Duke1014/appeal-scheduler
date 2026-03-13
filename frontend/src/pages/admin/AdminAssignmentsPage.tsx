import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Button, Input, Modal, Avatar, Badge } from '@/components/ui';
import { assignmentsApi, usersApi } from '@/api/client';
import type { Assignment, User } from '@/types';
import { Plus, Trash2, Pencil, UserPlus, UserMinus, Cpu } from 'lucide-react';

export default function AdminAssignmentsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [managing, setManaging] = useState<Assignment | null>(null);
  const [form, setForm] = useState({ name: '', uses_tech_devices: false, notes: '' });

  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ['assignments'],
    queryFn: () => assignmentsApi.list().then(r => r.data),
  });
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: (d: object) => assignmentsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments'] }); setShowCreate(false); setForm({ name: '', uses_tech_devices: false, notes: '' }); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => assignmentsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments'] }); setEditing(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => assignmentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  });
  const assignMut = useMutation({
    mutationFn: ({ aid, uid }: { aid: number; uid: number }) => assignmentsApi.assignVolunteer(aid, uid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  });
  const unassignMut = useMutation({
    mutationFn: ({ aid, uid }: { aid: number; uid: number }) => assignmentsApi.unassignVolunteer(aid, uid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  });

  const volunteers = allUsers.filter(u => u.role === 'volunteer' || u.role === 'employee');

  const openEdit = (a: Assignment) => {
    setEditing(a);
    setForm({ name: a.name, uses_tech_devices: a.uses_tech_devices, notes: a.notes ?? '' });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl">Assignments</h1>
            <p className="text-slate-400 text-sm mt-1">{assignments.length} total assignments</p>
          </div>
          <Button onClick={() => { setForm({ name: '', uses_tech_devices: false, notes: '' }); setShowCreate(true); }}>
            <Plus size={16} /> New Assignment
          </Button>
        </div>

        <div className="space-y-3">
          {assignments.map(a => (
            <Card key={a.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-white text-sm">{a.name}</p>
                    {a.uses_tech_devices && <Badge variant="info"><Cpu size={11} className="mr-1" />Tech</Badge>}
                  </div>
                  {a.notes && <p className="text-xs text-slate-400 line-clamp-2 mb-2">{a.notes}</p>}
                  {a.volunteers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {a.volunteers.map(v => (
                        <div key={v.id} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                          <Avatar src={v.photo_path} name={v.full_name} size="sm" />
                          <span className="text-xs text-white">{v.full_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-3 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setManaging(a)}><UserPlus size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Pencil size={14} /></Button>
                  <Button variant="danger" size="sm" onClick={() => { if (confirm('Delete?')) deleteMut.mutate(a.id); }}><Trash2 size={14} /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Create / Edit */}
      <Modal isOpen={showCreate || !!editing} onClose={() => { setShowCreate(false); setEditing(null); }} title={editing ? 'Edit Assignment' : 'New Assignment'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div className="flex items-center gap-3">
            <input type="checkbox" id="tech" checked={form.uses_tech_devices}
              onChange={e => setForm(f => ({ ...f, uses_tech_devices: e.target.checked }))}
              className="w-4 h-4 rounded" />
            <label htmlFor="tech" className="text-sm text-slate-300">Requires tech devices</label>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <Button onClick={() => editing ? updateMut.mutate({ id: editing.id, data: form }) : createMut.mutate(form)}
            loading={createMut.isPending || updateMut.isPending} className="w-full">
            {editing ? 'Save' : 'Create'}
          </Button>
        </div>
      </Modal>

      {/* Manage volunteers */}
      <Modal isOpen={!!managing} onClose={() => setManaging(null)} title={`Volunteers — ${managing?.name}`}>
        {managing && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {volunteers.map(v => {
              const assigned = managing.volunteers.some(mv => mv.id === v.id);
              return (
                <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                  <Avatar src={v.photo_path} name={v.full_name} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm text-white">{v.full_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{v.role}</p>
                  </div>
                  <Button
                    variant={assigned ? 'danger' : 'secondary'} size="sm"
                    onClick={() => assigned
                      ? unassignMut.mutate({ aid: managing.id, uid: v.id })
                      : assignMut.mutate({ aid: managing.id, uid: v.id })
                    }
                  >
                    {assigned ? <UserMinus size={14} /> : <UserPlus size={14} />}
                    {assigned ? 'Remove' : 'Assign'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}