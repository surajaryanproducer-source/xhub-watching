'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { formatDuration } from '@/lib/utils';

type Category = { id: string; name: string };
type Profile = { id: string; username: string | null };

const DRIVE_RE =
  /^(https?:\/\/)?(drive\.google\.com\/(file\/d\/([A-Za-z0-9_-]{10,})\/|uc\?id=([A-Za-z0-9_-]{10,}))|docs\.google\.com\/uc\?id=([A-Za-z0-9_-]{10,}))/;

function normalizeDriveUrl(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.hostname.includes('drive.google.com')) {
      const fileIdMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
      if (fileIdMatch?.[1]) {
        return `https://drive.google.com/uc?id=${fileIdMatch[1]}&export=download`;
      }
      const id = url.searchParams.get('id');
      if (id) {
        return `https://drive.google.com/uc?id=${id}&export=download`;
      }
    }
    if (url.hostname.includes('docs.google.com')) {
      const id = url.searchParams.get('id');
      if (id) {
        return `https://drive.google.com/uc?id=${id}&export=download`;
      }
    }
    return DRIVE_RE.test(input) ? input : null;
  } catch {
    return null;
  }
}

export default function UploadFromDriveForm() {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [profileId, setProfileId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTrending, setIsTrending] = useState(false);
  const [durationInput, setDurationInput] = useState<string>('');
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const { data: cats } = await supabase.from('categories').select('id, name').order('name');
      setCategories(cats || []);
    };
    const loadProfiles = async () => {
      try {
        const res = await supabase.from('profiles').select('id, username').order('username');
        if (res.error) throw res.error;
        if (res.data && res.data.length > 0) {
          setProfiles(res.data || []);
          return;
        }
        // Fallback to name column if username empty/not present
        const alt = await supabase.from('profiles').select('id, name').order('name');
        const mapped = (alt.data || []).map((p: any) => ({ id: p.id, username: p.name || null }));
        setProfiles(mapped);
      } catch {
        // Final fallback: try name
        const alt = await supabase.from('profiles').select('id, name').order('name');
        const mapped = (alt.data || []).map((p: any) => ({ id: p.id, username: p.name || null }));
        setProfiles(mapped);
      }
    };
    loadCategories();
    loadProfiles();
    // Listen for profiles list changes
    const onProfilesUpdated = () => loadProfiles();
    if (typeof window !== 'undefined') {
      window.addEventListener('profiles:updated', onProfilesUpdated as any);
      return () => window.removeEventListener('profiles:updated', onProfilesUpdated as any);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!videoUrl.trim()) {
      setError('Google Drive link is required');
      return;
    }
    if (!DRIVE_RE.test(videoUrl.trim())) {
      setError('Please paste a valid Google Drive shareable link');
      return;
    }
    if (!categoryId) {
      setError('Select a category');
      return;
    }
    if (!profileId) {
      setError('Select a profile/creator');
      return;
    }
    if (!thumbnailFile) {
      setError('Select a thumbnail image (jpg/png)');
      return;
    }
    if (!/^image\/(jpeg|png)$/.test(thumbnailFile.type)) {
      setError('Only JPG or PNG thumbnails are allowed');
      return;
    }

    const normalized = normalizeDriveUrl(videoUrl.trim());
    if (!normalized) {
      setError('Invalid Google Drive link format');
      return;
    }

    setSaving(true);
    try {
      // Try to auto-detect duration if not provided
      const parseDuration = (val: string): number => {
        const s = val.trim();
        if (!s) return 0;
        if (/^\d+$/.test(s)) return Math.max(0, Math.floor(Number(s)));
        const parts = s.split(':').map(n => Number(n));
        if (parts.some(isNaN)) return 0;
        if (parts.length === 2) {
          const [mm, ss] = parts;
          return Math.max(0, mm * 60 + ss);
        }
        if (parts.length === 3) {
          const [hh, mm, ss] = parts;
          return Math.max(0, hh * 3600 + mm * 60 + ss);
        }
        return 0;
      };
      let finalDuration = durationInput ? parseDuration(durationInput) : 0;
      if (finalDuration === 0) {
        setDetecting(true);
        const detected = await new Promise<number | null>((resolve) => {
          try {
            const vid = document.createElement('video');
            vid.preload = 'metadata';
            vid.crossOrigin = 'anonymous';
            vid.src = normalized;
            const clearAll = () => {
              vid.removeAttribute('src');
              try { vid.load(); } catch {}
            };
            const to = window.setTimeout(() => {
              clearAll();
              resolve(null);
            }, 8000);
            vid.onloadedmetadata = () => {
              window.clearTimeout(to);
              const d = Number.isFinite(vid.duration) ? Math.round(vid.duration) : 0;
              clearAll();
              resolve(d > 0 ? d : null);
            };
            vid.onerror = () => {
              window.clearTimeout(to);
              clearAll();
              resolve(null);
            };
          } catch {
            resolve(null);
          }
        });
        setDetecting(false);
        if (detected && detected > 0) {
          finalDuration = detected;
          setDurationInput(formatDuration(detected));
        }
      }

      // Read denormalized display fields to improve public rendering without joins/RLS
      let profileDisplay: string | null = null;
      let categoryDisplay: string | null = null;
      try {
        if (profileId) {
          const p = await supabase.from('profiles').select('*').eq('id', profileId).single();
          if (!p.error && p.data) {
            const pd: any = p.data as any;
            profileDisplay = pd.username ?? pd.name ?? null;
          }
        }
        if (categoryId) {
          const c = await supabase.from('categories').select('name').eq('id', categoryId).single();
          if (!c.error && c.data) {
            categoryDisplay = c.data.name ?? null;
          }
        }
      } catch { /* ignore */ }

      // Upload thumbnail to Supabase Storage
      const ext = thumbnailFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const name = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
      const { error: upErr } = await supabase
        .storage
        .from('thumbnails')
        .upload(name, thumbnailFile, { upsert: false, cacheControl: '3600', contentType: thumbnailFile.type });
      if (upErr) {
        const msg = upErr.message?.toLowerCase?.() || '';
        if (msg.includes('bucket')) {
          throw new Error('Storage bucket "thumbnails" not found. Create a public bucket named "thumbnails".');
        }
        throw upErr;
      }
      const { data: { publicUrl: thumbnailUrl } } = supabase.storage.from('thumbnails').getPublicUrl(name);

      const payload: any = {
        title: title.trim(),
        video_url: normalized,
        thumbnail_url: thumbnailUrl,
        category_id: categoryId,
        profile_id: profileId,
        duration: finalDuration,
        // Denormalized fields for fast public rendering (no joins needed)
        category: categoryDisplay,
        profile: profileDisplay,
        views: 0,
        is_trending: isTrending as any,
      };
      const { error: insErr } = await supabase.from('videos').insert(payload);
      if (insErr) throw insErr;

      setTitle('');
      setVideoUrl('');
      setThumbnailFile(null);
      setThumbPreview(null);
      setCategoryId('');
      setProfileId('');
      setIsTrending(false);
      setDurationInput('');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('videos:updated'));
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(err?.message || 'Failed to save video');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-white/10">
      <h2 className="text-lg font-bold mb-4">Add Video (Google Drive Link)</h2>
      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
            placeholder="Video title"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Video URL (Google Drive)</label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
            placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
          />
          <p className="text-xs text-gray-500 mt-1">
            Paste Google Drive share link (we&apos;ll stream via uc?id= format).
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Thumbnail (JPG/PNG)</label>
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center relative">
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setThumbnailFile(f);
                if (thumbPreview) URL.revokeObjectURL(thumbPreview);
                setThumbPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
            {thumbPreview ? (
              <div className="relative w-48 aspect-video mx-auto bg-black rounded overflow-hidden">
                <Image src={thumbPreview} alt="thumbnail preview" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="text-sm text-gray-400">Select a JPG/PNG file</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Profile / Creator</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">Select Profile</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.username || 'Unknown'}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Duration (mm:ss)</label>
          <input
            type="text"
            inputMode="numeric"
            value={durationInput}
            onChange={(e)=> setDurationInput(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
            placeholder="e.g., 10:00 (auto-detects if left blank)"
          />
          <p className="text-xs text-gray-500 mt-1">
            {detecting ? 'Detecting duration…' : (durationInput ? `Set: ${durationInput}` : 'Leave blank to auto-detect')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            id="isTrending"
            type="checkbox"
            className="h-4 w-4"
            checked={isTrending}
            onChange={(e)=>setIsTrending(e.target.checked)}
          />
          <label htmlFor="isTrending" className="text-sm text-gray-300">Mark as Trending</label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
        >
          {saving ? (detecting ? 'Saving… (detecting duration)' : 'Saving…') : 'Save Video'}
        </button>
      </form>
    </div>
  );
}
