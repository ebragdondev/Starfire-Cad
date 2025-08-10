'use client';
import { useEffect, useState } from 'react';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetch(base + '/communities', { credentials: 'include' })
      .then(async r => {
        if (!r.ok) throw new Error('bad');
        const d: { communities: any[] } = await r.json();
        return d;
      })
      .then(d => setCommunities(d.communities))
      .catch(() => setError('Unauthorized'));
  }, []);

  async function createCommunity(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(base + '/communities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name }) });
    if (res.ok) {
      setName('');
      const d: { community: any } = await res.json();
      setCommunities([...communities, d.community]);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Your Communities</h1>
      {error && <div className="text-red-600">{error}</div>}
      <ul className="space-y-1 text-sm">
        {communities.map(c => (<li key={c.id}>{c.name} ({c.slug})</li>))}
      </ul>
      <form onSubmit={createCommunity} className="flex gap-2">
        <input value={name} onChange={e => setName((e.target as HTMLInputElement).value)} placeholder="Community name" className="p-2 border rounded flex-1" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
      </form>
    </div>
  );
}