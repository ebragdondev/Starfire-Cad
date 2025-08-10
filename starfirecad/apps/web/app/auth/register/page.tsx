'use client';
import { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
      credentials: 'include'
    });
    if (!res.ok) setError('Registration failed');
    else window.location.href = '/';
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input value={email} onChange={e => setEmail((e.target as HTMLInputElement).value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input value={username} onChange={e => setUsername((e.target as HTMLInputElement).value)} placeholder="Username" className="w-full p-2 border rounded" />
        <input type="password" value={password} onChange={e => setPassword((e.target as HTMLInputElement).value)} placeholder="Password" className="w-full p-2 border rounded" />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Create account</button>
      </form>
    </div>
  );
}