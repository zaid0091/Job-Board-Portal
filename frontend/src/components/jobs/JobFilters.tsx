import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '@/hooks';
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
        className="input-field w-full flex items-center justify-between gap-2 text-left"
      >
        <span className={selected ? 'text-ink-800' : 'text-ink-400'}>{selected ? selected.label : placeholder}</span>
        <ChevronDownIcon className={`h-3.5 w-3.5 text-ink-300 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute z-50 mt-1 w-full bg-card rounded-xl border border-ink-900/[0.06] py-1 animate-scale-in origin-top max-h-60 overflow-y-auto"
          style={{ boxShadow: 'var(--card-shadow-lg)' }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                opt.value === value
                  ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 font-medium'
                  : 'text-ink-600 hover:bg-surface-50 hover:text-ink-800'
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
    <div className="bg-card rounded-xl p-5 space-y-4 mb-6" style={{ boxShadow: 'var(--card-shadow)' }}>
      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-300" />
        <input
          type="text"
          placeholder="Search jobs, companies, locations..."
          className="input-field pl-10"
          {...register('search')}
        />
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2 text-[13px] text-ink-400">
        <AdjustmentsHorizontalIcon className="h-4 w-4 text-ink-300" />
        <span className="font-medium text-ink-600">Filters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Job Type */}
        <CustomSelect
          placeholder="All Job Types"
          value={filters.job_type || ''}
          onChange={(v) => handleSelectChange('job_type', v)}
          options={[
            { value: '', label: 'All Job Types' },
            { value: 'FULL_TIME', label: 'Full Time' },
            { value: 'PART_TIME', label: 'Part Time' },
            { value: 'CONTRACT', label: 'Contract' },
            { value: 'INTERNSHIP', label: 'Internship' },
            { value: 'FREELANCE', label: 'Freelance' },
            { value: 'TEMPORARY', label: 'Temporary' },
          ]}
        />

        {/* Experience Level */}
        <CustomSelect
          placeholder="All Levels"
          value={filters.experience_level || ''}
          onChange={(v) => handleSelectChange('experience_level', v)}
          options={[
            { value: '', label: 'All Levels' },
            { value: 'ENTRY', label: 'Entry Level' },
            { value: 'MID', label: 'Mid Level' },
            { value: 'SENIOR', label: 'Senior Level' },
            { value: 'LEAD', label: 'Lead / Manager' },
            { value: 'EXECUTIVE', label: 'Executive' },
          ]}
        />

        {/* Location */}
        <input
          type="text"
          placeholder="Location"
          className="input-field"
          {...register('location')}
          onBlur={(e) => handleSelectChange('location', e.target.value)}
        />

        {/* Sort */}
        <CustomSelect
          placeholder="Sort By"
          value={filters.ordering || ''}
          onChange={(v) => handleSelectChange('ordering', v)}
          options={[
            { value: '', label: 'Sort By' },
            { value: '-date', label: 'Newest First' },
            { value: 'date', label: 'Oldest First' },
            { value: '-salary', label: 'Highest Salary' },
            { value: 'salary', label: 'Lowest Salary' },
            { value: '-views', label: 'Most Viewed' },
          ]}
        />
      </div>

      {/* Remote toggle */}
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={!!filters.is_remote}
          onChange={(e) => handleCheckboxChange('is_remote', e.target.checked)}
          className="h-3.5 w-3.5 rounded border-ink-200 text-primary-600 focus:ring-primary-500 transition-colors"
        />
        <span className="text-[13px] font-medium text-ink-600">Remote only</span>
      </label>
    </div>
  );
}
