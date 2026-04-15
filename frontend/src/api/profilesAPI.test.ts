import { describe, expect, it, vi, beforeEach } from 'vitest';

const axiosFns = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
}));

vi.mock('./axiosInstance', () => ({
  default: {
    get: axiosFns.get,
    post: axiosFns.post,
    patch: axiosFns.patch,
    delete: axiosFns.del,
  },
}));

import { profilesAPI } from './profilesAPI';

describe('profilesAPI resume parse endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts resume parsing upload', async () => {
    axiosFns.post.mockResolvedValueOnce({ data: { id: 'job-1', status: 'QUEUED' } });
    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    const result = await profilesAPI.parseResume(file);
    expect(axiosFns.post).toHaveBeenCalledWith(
      '/profiles/seeker/resume/parse/',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }),
    );
    expect(result).toEqual({ id: 'job-1', status: 'QUEUED' });
  });

  it('fetches parse status and preview', async () => {
    axiosFns.get.mockResolvedValueOnce({ data: { id: 'job-1', status: 'PROCESSING' } });
    axiosFns.get.mockResolvedValueOnce({ data: { job: { id: 'job-1' }, skills: [] } });
    const statusResult = await profilesAPI.getResumeParseStatus('job-1');
    const previewResult = await profilesAPI.getResumeParsePreview('job-1');
    expect(statusResult.status).toBe('PROCESSING');
    expect(previewResult.job.id).toBe('job-1');
  });
});
