import { useCallback, useEffect, useRef, useState } from 'react';
import { jobsAPI } from '@/api';
import type { JobListItem, JobFilters, PaginatedResponse } from '@/types';

interface UseInfiniteJobsReturn {
  jobs: JobListItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  loadMore: () => void;
  error: string | null;
}

export default function useInfiniteJobs(filters: Omit<JobFilters, 'page'>): UseInfiniteJobsReturn {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ count: 0, totalPages: 1, currentPage: 1 });
  const pageRef = useRef(1);
  const abortRef = useRef<AbortController | null>(null);
  // Serialised filters for change detection
  const filtersKey = JSON.stringify(filters);

  // Reset & fetch page 1 when filters change
  useEffect(() => {
    pageRef.current = 1;
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    jobsAPI
      .getJobs({ ...filters, page: 1 })
      .then((res: PaginatedResponse<JobListItem>) => {
        if (controller.signal.aborted) return;
        setJobs(res.results);
        setMeta({ count: res.count, totalPages: res.total_pages, currentPage: res.current_page });
        pageRef.current = res.current_page;
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.response?.data?.detail || 'Failed to fetch jobs');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || pageRef.current >= meta.totalPages) return;

    const nextPage = pageRef.current + 1;
    setIsLoadingMore(true);

    jobsAPI
      .getJobs({ ...filters, page: nextPage })
      .then((res: PaginatedResponse<JobListItem>) => {
        setJobs((prev) => [...prev, ...res.results]);
        setMeta({ count: res.count, totalPages: res.total_pages, currentPage: res.current_page });
        pageRef.current = res.current_page;
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load more jobs');
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingMore, meta.totalPages, filtersKey]);

  return {
    jobs,
    isLoading,
    isLoadingMore,
    hasMore: pageRef.current < meta.totalPages,
    totalCount: meta.count,
    currentPage: meta.currentPage,
    totalPages: meta.totalPages,
    loadMore,
    error,
  };
}
