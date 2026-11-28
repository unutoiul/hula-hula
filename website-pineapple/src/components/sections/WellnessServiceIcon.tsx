import type { WellnessServiceIcon as ServiceKind } from '../../data/content';

/** A consistent set of treatment-specific line icons, rather than one repeated spa symbol. */
export function WellnessServiceIcon({ kind }: { kind: ServiceKind }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {kind === 'hair' && (
        <>
          <path d="M8 25C5 21 6 10 11 7c5-4 13-1 14 6 1 5 0 9-2 12M11 16v5a5 5 0 0 0 10 0v-5M8 17c6-1 10-5 11-9M18 10c0 4 3 7 6 8M10 27h12" />
          <path d="M25 3v4M23 5h4M4 10v3M2.5 11.5h3" />
        </>
      )}
      {kind === 'scalp' && (
        <>
          <path d="M11 28v-6c-4-2-6-6-5-10 1-6 7-9 12-7 4 1 6 5 6 9l3 4h-4v6h-6v4" />
          <path d="M12 13c-1-6 4-7 8-6 0 5-3 8-8 6ZM12 13l5-3" />
        </>
      )}
      {kind === 'coconut' && (
        <>
          <path d="M5 16h22a11 11 0 0 1-22 0ZM8 19c3 4 13 4 16 0M10 28h12M16 15V7M16 9c-4-5-8-4-10-2 3 1 6 3 10 2ZM16 9c4-6 8-5 11-3-3 2-7 4-11 3" />
        </>
      )}
      {kind === 'face' && (
        <>
          <path d="M8 14V11a8 8 0 0 1 16 0v3M9 13v6c0 5 3 9 7 10 4-1 7-5 7-10v-6M9 12c5 0 8-3 9-6 0 4 3 6 5 6M11 17c1 1 2 1 3 0M18 17c1 1 2 1 3 0M14 23c1 1 3 1 4 0M3 15c0 5 1 8 4 10M29 15c0 5-1 8-4 10" />
        </>
      )}
      {kind === 'wax' && (
        <>
          <path d="M5 15h22v8a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5v-8ZM5 15c5 4 17 4 22 0M13 22h6M19 15l5-10a2 2 0 0 1 3 2l-5 9M11 5c-2 2 2 3 0 5M6 6c-2 2 2 3 0 5" />
        </>
      )}
    </svg>
  );
}
