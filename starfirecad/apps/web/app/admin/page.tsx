'use client';
import { useEffect, useState } from 'react';

type User = { id: string; email: string; username: string; globalRole: string; createdAt: string };

type Community = { id: string; name: string; slug: string; createdAt: string };

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    Promise.all([
      fetch(base + '/admin/users', { credentials: 'include' }).then(async r => {
        if (!r.ok) throw new Error('users');
        const d: { users: User[] } = await r.json();
        return d;
      }),
      fetch(base + '/admin/communities', { credentials: 'include' }).then(async r => {
        if (!r.ok) throw new Error('communities');
        const d: { communities: Community[] } = await r.json();
        return d;
      })
    ]).then(([u, c]) => { setUsers(u.users); setCommunities(c.communities); }).catch(() => setError('Unauthorized or server error'));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Global Admin</h1>
      {error && <div className="text-red-600">{error}</div>}
      <section>
        <h2 className="text-lg font-medium mb-2">Users</h2>
        <ul className="space-y-1 text-sm">
          {users.map(u => (<li key={u.id}>{u.username} · {u.email} · {u.globalRole}</li>))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-medium mb-2">Communities</h2>
        <ul className="space-y-1 text-sm">
          {communities.map(c => (<li key={c.id}>{c.name} ({c.slug})</li>))}
        </ul>
      </section>
    </div>
  );
}