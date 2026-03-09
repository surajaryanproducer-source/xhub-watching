'use client';

import { useCallback } from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  url?: string; // optional relative or absolute url
  title?: string;
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const onShare = useCallback(async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const targetUrl = url
      ? (url.startsWith('http') ? url : `${origin}${url}`)
      : (typeof window !== 'undefined' ? window.location.href : '');
    try {
      if (navigator.share) {
        await navigator.share({ url: targetUrl, title: title || 'Watch this video' });
        return;
      }
      await navigator.clipboard.writeText(targetUrl);
      alert('Link copied to clipboard');
    } catch {
      try {
        await navigator.clipboard.writeText(targetUrl);
        alert('Link copied to clipboard');
      } catch {
        // noop
      }
    }
  }, [url, title]);

  return (
    <button
      onClick={onShare}
      className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
      title="Share"
    >
      <Share2 className="w-4 h-4" />
      <span className="text-sm font-medium">Share</span>
    </button>
  );
}
