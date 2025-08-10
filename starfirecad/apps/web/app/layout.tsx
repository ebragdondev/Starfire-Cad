import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'StarfireCAD',
  description: 'Next-gen CAD/MDT for FiveM'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="font-bold">StarfireCAD</div>
            <nav className="space-x-3 text-sm">
              <a href="/" className="hover:underline">Dashboard</a>
              <a href="/admin" className="hover:underline">Admin</a>
              <a href="/communities" className="hover:underline">Communities</a>
              <a href="/auth/login" className="hover:underline">Login</a>
            </nav>
          </header>
          <main className="p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}