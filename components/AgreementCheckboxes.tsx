'use client';

export interface AgreementItem {
  id: string;
  label: string;
  href: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface AgreementCheckboxesProps {
  items: AgreementItem[];
  error?: string;
}

export default function AgreementCheckboxes({ items, error }: AgreementCheckboxesProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <label
          key={item.id}
          className="flex items-start gap-3 cursor-pointer group"
          onClick={() => item.onChange(!item.checked)}
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${item.checked ? 'border-[#FB6602] bg-[#FB6602]' : 'border-gray-400 bg-white'}`}
          >
            {item.checked && (
              <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="text-sm text-gray-700 leading-relaxed">
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-orange-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {item.label}
            </a>
            {' '}okudum ve kabul ediyorum
          </span>
        </label>
      ))}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
