'use client';

import { useId } from 'react';

export default function CustomerSelect({ customers, selectedId, onChange }) {
  const id = useId();

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">Nutzer wählen</label>
      <select
        id={id}
        value={selectedId || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="appearance-none bg-neutral-800 text-white px-4 py-2 pr-10 rounded-md text-sm border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-white"
      >
        <option value="" disabled>Wähle Nutzer…</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Custom Dropdown Icon */}
      <div className="pointer-events-none absolute right-3 top-2.5 text-neutral-400">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}