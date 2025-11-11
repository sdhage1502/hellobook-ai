import React from 'react';

export default function ColorPicker({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
  return (
    <input
      type="color"
      value={value || '#000000'}
      onChange={(e) => onChange && onChange(e.target.value)}
      aria-label="Color picker"
      style={{ width: 40, height: 32, border: 'none', background: 'transparent' }}
    />
  );
}