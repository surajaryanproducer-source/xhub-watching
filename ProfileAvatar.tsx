'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfileAvatarProps {
  profileId?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  alt?: string;
  size?: number; // pixels, square
  className?: string;
}

export default function ProfileAvatar({
  profileId,
  username,
  avatarUrl,
  alt = 'Creator',
  size = 36,
  className = '',
}: ProfileAvatarProps) {
  const [src, setSrc] = useState<string | null>(avatarUrl || null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (src) return;
      try {
        if (profileId) {
          const { data } = await supabase.from('profiles').select('*').eq('id', profileId).single();
          if (!cancelled && data) {
            const d = data as { avatar_url?: string | null; profile_image?: string | null };
            setSrc(d.avatar_url ?? d.profile_image ?? null);
            return;
          }
        }
        const name = username?.trim();
        if (name) {
          let cand: { avatar_url?: string | null; profile_image?: string | null } | null = null;
          try {
            const { data } = await supabase.from('profiles').select('*').eq('username', name).single();
            cand = (data as { avatar_url?: string | null; profile_image?: string | null }) || null;
          } catch {}
          if (!cand) {
            try {
              const { data } = await supabase.from('profiles').select('*').eq('name', name).single();
              cand = (data as { avatar_url?: string | null; profile_image?: string | null }) || null;
            } catch {}
          }
          if (!cancelled && cand) {
            setSrc(cand.avatar_url ?? cand.profile_image ?? null);
          }
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; }
  }, [profileId, username, src]);

  const dim = `${size}px`;
  if (src) {
    return (
      <div className={`relative rounded-full overflow-hidden bg-gray-700 flex-shrink-0 ${className}`} style={{ width: dim, height: dim }}>
        <Image src={src} alt={alt} fill className="object-cover" unoptimized />
      </div>
    );
  }
  const letter = (username || alt || '?').charAt(0).toUpperCase();
  return (
    <div
      className={`rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300 flex-shrink-0 ${className}`}
      style={{ width: dim, height: dim }}
      aria-label={alt}
      title={alt}
    >
      {letter}
    </div>
  );
}
