'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface RegisterViewProps {
  videoId: string;
  cooldownMs?: number; // min time to count again from same device
}

export default function RegisterView({ videoId, cooldownMs = 6 * 60 * 60 * 1000 }: RegisterViewProps) {
  const doneRef = useRef(false);
  useEffect(() => {
    if (!videoId || doneRef.current) return;
    const key = `viewed:${videoId}`;
    try {
      const now = Date.now();
      const prev = Number(localStorage.getItem(key) || '0');
      if (Number.isFinite(prev) && now - prev < cooldownMs) {
        doneRef.current = true;
        return;
      }
    } catch {}
    (async () => {
      try {
        // Read and then update (non-atomic, acceptable for small scale)
        const { data } = await supabase.from('videos').select('views').eq('id', videoId).single();
        const current = (data?.views ?? 0) as number;
        await supabase.from('videos').update({ views: current + 1 }).eq('id', videoId);
        try {
          localStorage.setItem(key, String(Date.now()));
        } catch {}
      } catch {
        // ignore failures silently
      } finally {
        doneRef.current = true;
      }
    })();
  }, [videoId, cooldownMs]);
  return null;
}
