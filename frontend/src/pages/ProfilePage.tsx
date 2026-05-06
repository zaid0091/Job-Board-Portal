import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { profilesAPI } from '@/api';
import { fetchEmployerProfile, updateEmployerProfile, fetchSeekerProfile, updateSeekerProfile } from '@/store/slices/profileSlice';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SEO from '@/components/SEO';
import toast from 'react-hot-toast';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import type {
  ParsedEducation,
  ParsedExperience,
  ParsedSkill,
  ResumeParseJob,
  ResumeParsePreview,
  SeekerProfile,
} from '@/types';

export default function ProfilePage() {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const isEmployer = user?.role === 'EMPLOYER';

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <SEO title="Profile" noindex />
      <h1 className="text-display-sm text-ink-900 mb-8">Profile</h1>
      {isEmployer ? <EmployerProfileSection /> : <SeekerProfileSection />}
    </div>
  );
}

function EmployerProfileSection() {
  const dispatch = useAppDispatch();
  const { employerProfile, isLoading, error } = useAppSelector((state) => state.profile);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    website: '',
    description: '',
    company_size: '',
    industry: '',
    location: '',
    founded_year: '',
  });
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    dispatch(fetchEmployerProfile());
  }, [dispatch]);

  useEffect(() => {
    if (employerProfile) {
      setForm({
        company_name: employerProfile.company_name || '',
        website: employerProfile.company_website || '',
        description: employerProfile.description || '',
        company_size: employerProfile.company_size || '',
        industry: employerProfile.industry || '',
        location: employerProfile.location || '',
        founded_year: employerProfile.founded_year?.toString() || '',
      });
      setLogoUrl(employerProfile.company_logo || null);
      if (employerProfile.location) {
        const parts = employerProfile.location.split(', ');
        if (parts.length === 2) {
          setCountry(parts[1]);
          setRegion(parts[0]);
        }
      }
    }
  }, [employerProfile]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'website') {
          formData.append('company_website', String(value));
        } else {
          formData.append(key, String(value));
        }
      });
      if (logoFile) {
        formData.append('company_logo', logoFile);
      }
      await dispatch(updateEmployerProfile(formData)).unwrap();
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 sm:p-8 space-y-5" style={{ boxShadow: 'var(--card-shadow)' }}>
      <div className="flex items-center gap-6 mb-2">
        <div className="relative">
          <img
            src={logoUrl || '/default-company-logo.png'}
            alt="Company Logo"
            className="h-20 w-20 rounded-xl object-cover border border-ink-200 bg-surface-100 p-2"
          />
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-1.5 shadow-lg border-2 border-white"
            title="Change logo"
            style={{ lineHeight: 0 }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4 2.828 2.828 0 014 4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7v6a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h7a2 2 0 012 2z" />
            </svg>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </button>
        </div>
        <div>
          <p className="text-[13px] text-ink-500">Company Logo (JPG, PNG, max 2MB)</p>
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1">Company Name</label>
        <input
          type="text"
          className="input-field"
          value={form.company_name}
          onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1">Location</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <CountryDropdown
              value={country}
              onChange={(val) => {
                setCountry(val);
                setRegion('');
                setForm({ ...form, location: region && val ? `${region}, ${val}` : val });
              }}
              className="input-field"
            />
          </div>
          <div>
            <RegionDropdown
              country={country}
              value={region}
              onChange={(val) => {
                setRegion(val);
                setForm({ ...form, location: `${val}, ${country}` });
              }}
              className="input-field"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1">Website</label>
        <input
          type="url"
          className="input-field"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1">Industry</label>
        <input
          type="text"
          className="input-field"
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1">Company Size</label>
        <select
          className="input-field"
          value={form.company_size}
          onChange={(e) => setForm({ ...form, company_size: e.target.value })}
        >
          <option value="">Select</option>
          <option value="1-10">1-10</option>
          <option value="11-50">11-50</option>
          <option value="51-200">51-200</option>
          <option value="201-500">201-500</option>
          <option value="501-1000">501-1000</option>
          <option value="1001+">1001+</option>
        </select>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1">Founded Year</label>
        <input
          type="number"
          min={1800}
          max={new Date().getFullYear()}
          className="input-field"
          value={form.founded_year}
          onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1">Company Description</label>
        <textarea
          rows={4}
          className="input-field"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 text-[13px]">
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}

type SeekerFormState = {
  headline: string;
  bio: string;
  location: string;
  phone: string;
  portfolio_url: string;
  linkedin_url: string;
  github_url: string;
  experience_years: number;
};

function mapProfileToForm(profile: SeekerProfile): SeekerFormState {
  return {
    headline: profile.headline || '',
    bio: profile.bio || '',
    location: profile.location || '',
    phone: profile.phone || '',
    portfolio_url: profile.portfolio_url || '',
    linkedin_url: profile.linkedin_url || '',
    github_url: profile.github_url || '',
    experience_years: profile.experience_years || 0,
  };
}

function SeekerProfileSection() {
  const dispatch = useAppDispatch();
  const { seekerProfile, isLoading, error } = useAppSelector((state) => state.profile);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SeekerFormState>(mapProfileToForm({} as SeekerProfile));
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeJob, setResumeJob] = useState<ResumeParseJob | null>(null);
  const [resumePreview, setResumePreview] = useState<ResumeParsePreview | null>(null);
  const [parseApplying, setParseApplying] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedHeadline, setEditedHeadline] = useState('');
  const [editedExperienceYears, setEditedExperienceYears] = useState(0);
  const [editedSkills, setEditedSkills] = useState<ParsedSkill[]>([]);
  const [editedExperiences, setEditedExperiences] = useState<ParsedExperience[]>([]);
  const [editedEducations, setEditedEducations] = useState<ParsedEducation[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchSeekerProfile());
  }, [dispatch]);

  useEffect(() => {
    if (seekerProfile) {
      setForm(mapProfileToForm(seekerProfile));
      setAvatarUrl(seekerProfile.avatar || null);
      if (seekerProfile.location) {
        const parts = seekerProfile.location.split(', ');
        if (parts.length === 2) {
          setRegion(parts[0]);
          setCountry(parts[1]);
        }
      }
    }
  }, [seekerProfile]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (!resumeJob || resumeJob.status === 'REVIEW_READY' || resumeJob.status === 'FAILED') {
      return;
    }
    const timer = window.setInterval(async () => {
      try {
        const status = await profilesAPI.getResumeParseStatus(resumeJob.id);
        setResumeJob(status);
        if (status.status === 'REVIEW_READY') {
          const preview = await profilesAPI.getResumeParsePreview(status.id);
          hydratePreview(preview);
          window.clearInterval(timer);
        }
      } catch {
        window.clearInterval(timer);
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [resumeJob]);

  const parseInProgress = useMemo(
    () => resumeJob?.status === 'QUEUED' || resumeJob?.status === 'PROCESSING',
    [resumeJob],
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleResumeSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setResumeFile(selectedFile);
    setResumePreview(null);
    try {
      const job = await profilesAPI.parseResume(selectedFile);
      setResumeJob(job);
      toast.success('Resume parsing started');
    } catch {
      toast.error('Failed to start resume parsing');
    }
  };

  const hydratePreview = (preview: ResumeParsePreview) => {
    setResumePreview(preview);
    setEditedSummary(preview.summary || '');
    setEditedLocation(preview.location || '');
    setEditedHeadline((preview.normalized_payload?.headline as string) || form.headline || '');
    setEditedExperienceYears(Number(preview.normalized_payload?.experience_years || form.experience_years || 0));
    setEditedSkills(preview.skills || []);
    setEditedExperiences(preview.experiences || []);
    setEditedEducations(preview.educations || []);
    toast.success('Resume parsed. Review autofill suggestions.');
  };

  const handleApplyAutofill = async () => {
    if (!resumeJob) return;
    setParseApplying(true);
    try {
      const response = await profilesAPI.applyResumeAutofill(resumeJob.id, {
        summary: editedSummary,
        location: editedLocation,
        headline: editedHeadline,
        experience_years: editedExperienceYears,
        skills: editedSkills,
        experiences: editedExperiences,
        educations: editedEducations,
      });
      setForm(mapProfileToForm(response.profile));
      setAvatarUrl(response.profile.avatar || null);
      setResumePreview(null);
      toast.success('Autofill applied to profile');
    } catch {
      toast.error('Failed to apply autofill');
    } finally {
      setParseApplying(false);
    }
  };

  const handleDiscardAutofill = async () => {
    if (!resumeJob) return;
    try {
      await profilesAPI.discardResumeParse(resumeJob.id);
      setResumeJob(null);
      setResumePreview(null);
      setResumeFile(null);
      toast.success('Parsed draft discarded');
    } catch {
      toast.error('Failed to discard parsed draft');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      await dispatch(updateSeekerProfile(formData)).unwrap();
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 sm:p-8 space-y-5" style={{ boxShadow: 'var(--card-shadow)' }}>
      <div className="flex items-center gap-6 mb-2">
        <div className="relative">
          <img
            src={avatarUrl || '/default-avatar.png'}
            alt="Avatar"
            className="h-20 w-20 rounded-full object-cover border border-ink-200 bg-surface-100"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-1.5 shadow-lg border-2 border-white"
            title="Change avatar"
            style={{ lineHeight: 0 }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4 2.828 2.828 0 014 4z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7v6a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h7a2 2 0 012 2z" />
            </svg>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </button>
        </div>
        <div>
          <p className="text-[13px] text-ink-500">Profile photo (JPG, PNG, max 2MB)</p>
        </div>
      </div>
      <div className="rounded-xl border border-ink-900/[0.08] dark:border-ink-300/[0.12] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-ink-700">Resume Parsing + Autofill</p>
            <p className="text-[12px] text-ink-400">
              Upload resume and review extracted summary, location, skills, experience, and education.
            </p>
          </div>
          <button
            type="button"
            onClick={() => resumeInputRef.current?.click()}
            disabled={parseInProgress}
            className="btn-secondary text-[13px] py-2 px-3"
          >
            {parseInProgress ? 'Parsing...' : 'Upload resume'}
          </button>
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleResumeSelection}
          />
        </div>
        {(resumeFile || resumeJob) && (
          <div className="text-[12px] text-ink-500">
            {resumeFile?.name ? `Selected: ${resumeFile.name}` : 'Resume selected'}
            {resumeJob ? ` • Status: ${resumeJob.status} (${resumeJob.progress}%)` : ''}
          </div>
        )}
        {resumePreview && (
          <div className="space-y-4 pt-2">
            {resumePreview.warnings.length > 0 && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-[12px] text-amber-700 dark:text-amber-300">
                {resumePreview.warnings.join(' ')}
              </div>
            )}
            <div>
              <label className="block text-[13px] font-medium text-ink-600 mb-1">Autofill Headline</label>
              <input
                type="text"
                className="input-field"
                value={editedHeadline}
                onChange={(e) => setEditedHeadline(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-600 mb-1">Autofill Summary</label>
              <textarea
                rows={4}
                className="input-field"
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-ink-600 mb-1">Autofill Location</label>
                <input
                  type="text"
                  className="input-field"
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-ink-600 mb-1">Autofill Experience Years</label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  value={editedExperienceYears}
                  onChange={(e) => setEditedExperienceYears(parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-ink-600 mb-2">Detected Skills</p>
              <div className="flex flex-wrap gap-2">
                {editedSkills.length > 0 ? editedSkills.map((skill) => (
                  <span key={skill.name} className="px-2 py-1 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs">
                    {skill.name} {typeof skill.confidence === 'number' ? `(${Math.round(skill.confidence * 100)}%)` : ''}
                  </span>
                )) : <span className="text-[12px] text-ink-400">No skills detected.</span>}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] font-medium text-ink-600 mb-2">Detected Experiences</p>
                <div className="space-y-2 max-h-48 overflow-y-auto premium-sidebar-scroll pr-2">
                  {editedExperiences.length > 0 ? editedExperiences.map((exp, idx) => (
                    <div key={`${exp.company_name}-${exp.job_title}-${idx}`} className="rounded-md border border-ink-900/[0.06] p-2 text-xs">
                      <p className="font-medium text-ink-700">{exp.job_title || 'Role'}</p>
                      <p className="text-ink-500">{exp.company_name || 'Company'}</p>
                    </div>
                  )) : <p className="text-[12px] text-ink-400">No experiences detected.</p>}
                </div>
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink-600 mb-2">Detected Education</p>
                <div className="space-y-2 max-h-48 overflow-y-auto premium-sidebar-scroll pr-2">
                  {editedEducations.length > 0 ? editedEducations.map((edu, idx) => (
                    <div key={`${edu.institution}-${edu.degree}-${idx}`} className="rounded-md border border-ink-900/[0.06] p-2 text-xs">
                      <p className="font-medium text-ink-700">{edu.degree || 'Degree'}</p>
                      <p className="text-ink-500">{edu.institution || 'Institution'}</p>
                    </div>
                  )) : <p className="text-[12px] text-ink-400">No education detected.</p>}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleApplyAutofill}
                disabled={parseApplying}
                className="btn-primary py-2 px-4 text-[13px]"
              >
                {parseApplying ? 'Applying...' : 'Apply Autofill'}
              </button>
              <button
                type="button"
                onClick={handleDiscardAutofill}
                className="btn-secondary py-2 px-4 text-[13px]"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Professional Title</label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g. Full Stack Developer"
          value={form.headline}
          onChange={(e) => setForm({ ...form, headline: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[13px] font-medium text-ink-600 mb-1">Location</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <CountryDropdown
                value={country}
                onChange={(val) => {
                  setCountry(val);
                  setRegion('');
                  setForm({ ...form, location: region && val ? `${region}, ${val}` : val });
                }}
                className="input-field"
              />
            </div>
            <div>
              <RegionDropdown
                country={country}
                value={region}
                onChange={(val) => {
                  setRegion(val);
                  setForm({ ...form, location: `${val}, ${country}` });
                }}
                className="input-field"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ink-600 mb-1">Years of Experience</label>
          <input
            type="number"
            min={0}
            className="input-field"
            value={form.experience_years}
            onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1">Phone</label>
        <input
          type="tel"
          className="input-field"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1">Portfolio Website</label>
        <input
          type="url"
          className="input-field"
          value={form.portfolio_url}
          onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[13px] font-medium text-ink-600 mb-1">LinkedIn URL</label>
          <input
            type="url"
            className="input-field"
            value={form.linkedin_url}
            onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ink-600 mb-1">GitHub URL</label>
          <input
            type="url"
            className="input-field"
            value={form.github_url}
            onChange={(e) => setForm({ ...form, github_url: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1">Bio</label>
        <textarea
          rows={4}
          className="input-field"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </div>
      <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 text-[13px]">
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}
