'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatViews } from '@/lib/utils';

interface ViewsCountProps {
  videoId: string;
  initial: number;
}

export default function ViewsCount({ videoId, initial }: ViewsCountProps) {
  const [count, setCount] = useState<number>(initial ?? 0);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.from('videos').select('views').eq('id', videoId).single();
        if (mounted && typeof data?.views === 'number') setCount(data.views);
      } catch {}
    })();
    return () => { mounted = false };
  }, [videoId]);
  return <span>{formatViews(count)} views</span>;
}
