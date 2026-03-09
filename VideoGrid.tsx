import VideoCard from './VideoCard';
import { Database } from '@/types/supabase';

type Video = Database['public']['Tables']['videos']['Row'] & {
  category?: { name: string } | null;
  profile?: { username: string; avatar_url: string | null } | null;
};

interface VideoGridProps {
  videos: Video[];
  title?: string;
}

export default function VideoGrid({ videos, title }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 text-lg">No videos found.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      {title && (
        <h2 className="text-2xl font-bold text-white mb-6 px-4">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
