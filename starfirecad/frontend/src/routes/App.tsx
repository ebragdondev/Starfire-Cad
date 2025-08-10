import { useState } from 'react';

export default function App() {
  const [layoutSaved, setLayoutSaved] = useState(false);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">StarfireCAD (Appwrite Edition)</h1>
      <p className="text-sm opacity-80">Multi-tenant, SaaS-ready, AI-enhanced CAD/MDT</p>
      <div className="mt-6 space-x-2">
        <button className="px-3 py-2 bg-blue-600 text-white rounded">Login</button>
        <button className="px-3 py-2 bg-neutral-200 rounded">Register</button>
      </div>
      <div className="mt-6">
        <button onClick={() => setLayoutSaved(true)} className="px-3 py-2 bg-green-600 text-white rounded">Save Layout</button>
        {layoutSaved && <div className="text-green-700 text-sm mt-2">Layout saved to Appwrite (placeholder)</div>}
      </div>
    </div>
  );
}