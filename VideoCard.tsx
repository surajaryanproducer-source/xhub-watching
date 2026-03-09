'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatDuration, formatTimeAgo, formatViews } from '@/lib/utils';
import { Database } from '@/types/supabase';
import ProfileAvatar from './ProfileAvatar';

type Video = Database['public']['Tables']['videos']['Row'] & {
  category?: { name: string } | null;
  profile?: { username: string; avatar_url: string | null } | null;
};

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Link prefetch={false} href={`/watch/${video.id}`} className="group block w-full">
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800">
        <Image
          src={video.thumbnail_url || '/placeholder.svg'}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-medium">
          {formatDuration(video.duration)}
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 flex gap-3 items-start">
        <ProfileAvatar
          profileId={(video as Database['public']['Tables']['videos']['Row']).profile_id ?? null}
          username={video.profile?.username || null}
          avatarUrl={video.profile?.avatar_url || null}
          alt={video.profile?.username || 'Creator'}
          size={36}
          className="w-9 h-9"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
            {video.title}
          </h3>
          <p className="text-gray-400 text-sm mt-1 truncate hover:text-white transition-colors">
            {video.profile?.username || 'Unknown Creator'}
          </p>
          <div className="text-gray-400 text-xs mt-1 flex items-center gap-1">
             <span>{formatViews(video.views)} views</span>
             <span>•</span>
             <span suppressHydrationWarning>{formatTimeAgo(video.created_at)}</span>
          </div>
          {video.category && (
             <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-300 hover:bg-white/20 transition-colors">
               {video.category.name}
             </span>
          )}
        </div>
      </div>
    </Link>
  );
}
