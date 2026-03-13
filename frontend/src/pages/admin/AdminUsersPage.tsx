import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Button, Avatar, RoleBadge, Modal, Select, Badge } from '@/components/ui';
import { usersApi } from '@/api/client';
import type { User } from '@/types';
import { Search, Trash2, UserCog } from 'lucide-react';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [photoUser, setPhotoUser] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => usersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setSelectedUser(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const photoMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => usersApi.uploadPhoto(id, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setPhotoUser(null); },
  });

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl">Users</h1>
            <p className="text-slate-400 text-sm mt-1">{users.length} total users</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {filtered.map(user => (
              <Card key={user.id} className="flex items-center gap-4">
                <button onClick={() => setPhotoUser(user)}>
                  <Avatar src={user.photo_path} name={user.full_name} size="md" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{user.full_name}</p>
                    <RoleBadge role={user.role} />
                    {!user.is_active && <Badge variant="danger">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                    <UserCog size={15} />
                  </Button>
                  <Button
                    variant="danger" size="sm"
                    onClick={() => { if (confirm(`Delete ${user.full_name}?`)) deleteMutation.mutate(user.id); }}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit user modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Edit User">
        {selectedUser && (
          <EditUserForm
            user={selectedUser}
            onSave={(data) => updateMutation.mutate({ id: selectedUser.id, data })}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Photo modal */}
      <Modal isOpen={!!photoUser} onClose={() => setPhotoUser(null)} title="Update Photo">
        {photoUser && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar src={photoUser.photo_path} name={photoUser.full_name} size="xl" />
            </div>
            <input
              type="file" accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) photoMutation.mutate({ id: photoUser.id, file });
              }}
              className="text-sm text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-600 file:text-white"
            />
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

function EditUserForm({ user, onSave, loading }: { user: User; onSave: (d: object) => void; loading: boolean }) {
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.is_active);
  return (
    <div className="space-y-4">
      <Select
        label="Role" id="role" value={role}
        onChange={e => setRole(e.target.value as typeof role)}
        options={[
          { value: 'volunteer', label: 'Volunteer' },
          { value: 'employee', label: 'Employee' },
          { value: 'admin', label: 'Admin' },
        ]}
      />
      <div className="flex items-center gap-3">
        <input type="checkbox" id="active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 rounded" />
        <label htmlFor="active" className="text-sm text-slate-300">Active account</label>
      </div>
      <Button onClick={() => onSave({ role, is_active: isActive })} loading={loading} className="w-full">Save Changes</Button>
    </div>
  );
}