import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { profilesAPI } from '@/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SEO from '@/components/SEO';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const isEmployer = user?.role === 'EMPLOYER';

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <SEO title="Profile" />
      <h1 className="text-display-sm text-ink-900 mb-8">Profile</h1>
      {isEmployer ? <EmployerProfileSection /> : <SeekerProfileSection />}
    </div>
  );
}

function EmployerProfileSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    website: '',
    description: '',
    company_size: '',
    industry: '',
    location: '',
  });

  useEffect(() => {
    profilesAPI
      .getEmployerProfile()
      .then((res) => {
        setForm({
          company_name: res.company_name || '',
          website: res.website || '',
          description: res.description || '',
          company_size: res.company_size || '',
          industry: res.industry || '',
          location: res.location || '',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      await profilesAPI.updateEmployerProfile(formData);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 sm:p-8 space-y-5" style={{ boxShadow: 'var(--card-shadow)' }}>
      <div>
        <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Company Name</label>
        <input
          type="text"
          className="input-field"
          value={form.company_name}
          onChange={(e) => setForm({ ...form, company_name: e.target.value })}
        />
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
      <div className="grid grid-cols-2 gap-3">
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
          <label className="block text-[13px] font-medium text-ink-600 mb-1">Location</label>
          <input
            type="text"
            className="input-field"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
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

import { useRef } from 'react';
// ...existing code...
function SeekerProfileSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    headline: '',
    bio: '',
    location: '',
    phone: '',
    portfolio_url: '',
    linkedin_url: '',
    github_url: '',
    experience_years: 0,
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    profilesAPI
      .getSeekerProfile()
      .then((res) => {
        setForm({
          headline: res.headline || '',
          bio: res.bio || '',
          location: res.location || '',
          phone: res.phone || '',
          portfolio_url: res.portfolio_url || '',
          linkedin_url: res.linkedin_url || '',
          github_url: res.github_url || '',
          experience_years: res.experience_years || 0,
        });
        setAvatarUrl(res.avatar || null);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
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
      await profilesAPI.updateSeekerProfile(formData);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

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
          <input
            type="text"
            className="input-field"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
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
        <label className="block text-[13px] font-medium text-ink-600 mb-1">Website</label>
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
