import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useDebounce } from '@/hooks';
import SectionBadge from '@/components/ui/SectionBadge';
import type { JobFilters } from '@/types';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input-field flex w-full items-center justify-between gap-2 rounded-xl border-ink-900/[0.08] bg-card/80 text-left backdrop-blur-sm transition-shadow focus:ring-2 focus:ring-primary-500/20 dark:border-white/[0.08]"
      >
        <span className={selected ? 'font-medium text-ink-800 dark:text-zinc-200' : 'text-ink-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 text-ink-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          data-lenis-prevent
          className="animate-scale-in absolute z-50 mt-1.5 max-h-60 w-full origin-top overflow-y-auto overscroll-y-contain rounded-xl border border-ink-900/[0.08] bg-card/95 py-1 shadow-xl backdrop-blur-xl dark:border-white/[0.08]"
          style={{ boxShadow: 'var(--card-shadow-lg)' }}
          onWheel={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 text-left text-[13px] transition-colors ${
                opt.value === value
                  ? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                  : 'text-ink-600 hover:bg-surface-50 hover:text-ink-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface JobFiltersProps {
  filters: JobFilters;
  onFilterChange: (filters: JobFilters) => void;
}

export default function JobFiltersComponent({ filters, onFilterChange }: JobFiltersProps) {
  const { register, watch, setValue } = useForm<JobFilters>({
    defaultValues: filters,
  });

  const searchValue = watch('search');
  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ ...filters, search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const handleSelectChange = (field: keyof JobFilters, value: string) => {
    const newFilters = { ...filters, [field]: value || undefined, page: 1 };
    onFilterChange(newFilters);
    setValue(field, value || undefined);
  };

  const handleCheckboxChange = (field: keyof JobFilters, checked: boolean) => {
    const newFilters = { ...filters, [field]: checked || undefined, page: 1 };
    onFilterChange(newFilters);
  };

  return (
    <div
      className="overflow-visible rounded-2xl border border-ink-900/[0.06] bg-card/90 p-5 shadow-sm backdrop-blur-xl dark:border-white/[0.08]"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <SectionBadge label="Refine" />
        <AdjustmentsHorizontalIcon className="h-5 w-5 text-primary-500/60" />
      </div>

      <div className="relative mb-5">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500/50" />
        <input
          type="text"
          placeholder="Title, skills, company..."
          className="input-field rounded-xl border-ink-900/[0.08] bg-card/80 pl-10 backdrop-blur-sm transition-shadow focus:border-primary-300 focus:ring-2 focus:ring-primary-500/15 dark:border-white/[0.08]"
          {...register('search')}
        />
      </div>

      <div className="space-y-3">
        <CustomSelect
          placeholder="Job type"
          value={filters.job_type || ''}
          onChange={(v) => handleSelectChange('job_type', v)}
          options={[
            { value: '', label: 'All job types' },
            { value: 'FULL_TIME', label: 'Full time' },
            { value: 'PART_TIME', label: 'Part time' },
            { value: 'CONTRACT', label: 'Contract' },
            { value: 'INTERNSHIP', label: 'Internship' },
            { value: 'FREELANCE', label: 'Freelance' },
            { value: 'TEMPORARY', label: 'Temporary' },
          ]}
        />

        <CustomSelect
          placeholder="Experience"
          value={filters.experience_level || ''}
          onChange={(v) => handleSelectChange('experience_level', v)}
          options={[
            { value: '', label: 'All levels' },
            { value: 'ENTRY', label: 'Entry level' },
            { value: 'MID', label: 'Mid level' },
            { value: 'SENIOR', label: 'Senior level' },
            { value: 'LEAD', label: 'Lead / manager' },
            { value: 'EXECUTIVE', label: 'Executive' },
          ]}
        />

        <div className="relative">
          <MapPinIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="text"
            placeholder="City or region"
            className="input-field rounded-xl border-ink-900/[0.08] bg-card/80 pl-10 backdrop-blur-sm dark:border-white/[0.08]"
            {...register('location')}
            onBlur={(e) => handleSelectChange('location', e.target.value)}
          />
        </div>

        <CustomSelect
          placeholder="Sort by"
          value={filters.ordering || ''}
          onChange={(v) => handleSelectChange('ordering', v)}
          options={[
            { value: '', label: 'Default' },
            { value: '-date', label: 'Newest first' },
            { value: 'date', label: 'Oldest first' },
            { value: '-salary', label: 'Highest salary' },
            { value: 'salary', label: 'Lowest salary' },
            { value: '-views', label: 'Most viewed' },
          ]}
        />
      </div>

      <div className="mt-5 border-t border-ink-900/[0.04] pt-5 dark:border-white/[0.06]">
        <button
          type="button"
          role="switch"
          aria-checked={!!filters.is_remote}
          onClick={() => handleCheckboxChange('is_remote', !filters.is_remote)}
          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-[13px] font-semibold transition-all ${
            filters.is_remote
              ? 'border-primary-300 bg-primary-50 text-primary-800 shadow-sm dark:border-primary-700/50 dark:bg-primary-950/40 dark:text-primary-200'
              : 'border-ink-900/[0.06] bg-surface-50/80 text-ink-600 hover:border-primary-200 hover:bg-primary-50/50 dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-zinc-300'
          }`}
        >
          <span className="min-w-0 text-left">Remote only</span>
          <span
            aria-hidden
            className={`relative inline-flex h-5 w-10 flex-shrink-0 overflow-hidden rounded-full p-0.5 transition-colors ${
              filters.is_remote ? 'bg-primary-600' : 'bg-ink-200 dark:bg-zinc-600'
            }`}
          >
            <span
              className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
                filters.is_remote ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
