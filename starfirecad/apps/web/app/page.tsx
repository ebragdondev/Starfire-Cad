'use client';
import { Responsive, WidthProvider, type Layouts } from 'react-grid-layout';
import { useEffect, useState } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultLayouts: Layouts = {
  lg: [
    { i: 'unit-status', x: 0, y: 0, w: 6, h: 6 },
    { i: 'bolo', x: 6, y: 0, w: 6, h: 6 },
    { i: 'calls', x: 0, y: 6, w: 12, h: 8 },
  ]
};

export default function DashboardPage() {
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);

  useEffect(() => {
    const saved = localStorage.getItem('starfire_layouts');
    if (saved) setLayouts(JSON.parse(saved));
  }, []);

  const onLayoutChange = (_: any, allLayouts: Layouts) => {
    setLayouts(allLayouts);
    localStorage.setItem('starfire_layouts', JSON.stringify(allLayouts));
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={onLayoutChange}
      >
        <div key="unit-status" className="bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 p-3">Unit Status</div>
        <div key="bolo" className="bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 p-3">BOLO</div>
        <div key="calls" className="bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 p-3">Calls</div>
      </ResponsiveGridLayout>
    </div>
  );
}