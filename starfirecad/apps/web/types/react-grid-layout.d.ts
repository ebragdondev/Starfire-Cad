declare module 'react-grid-layout' {
  import * as React from 'react';
  export interface Layout { i: string; x: number; y: number; w: number; h: number }
  export interface Layouts { [key: string]: Layout[] }
  export const Responsive: React.ComponentType<any>;
  export function WidthProvider<T>(component: T): T;
}