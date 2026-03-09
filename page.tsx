import { getRelatedVideos, getVideo } from '@/lib/fetch';
import { formatTimeAgo, formatViews } from '@/lib/utils';
import { User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import VideoCard from '@/components/VideoCard';
import ShareButton from '@/components/ShareButton';
import RegisterView from '@/components/RegisterView';
import ViewsCount from '@/components/ViewsCount';
import ProfileAvatar from '@/components/ProfileAvatar';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    notFound();
  }

  const relatedVideos = await getRelatedVideos(video.category_id || '', video.id);
  
  // Normalize Google Drive link(s)
  const deriveDrive = (input?: string | null): { direct: string; preview: string | null } | null => {
    if (!input) return null;
    try {
      const url = new URL(input);
      // /file/d/<id>/view?...
      const m = url.pathname.match(/\/file\/d\/([^/]+)/);
      if (m?.[1]) {
        const fid = m[1];
        return {
          direct: `https://drive.google.com/uc?id=${fid}&export=download`,
          preview: `https://drive.google.com/file/d/${fid}/preview`
        };
      }
      const idParam = url.searchParams.get('id');
      if (idParam) {
        return {
          direct: `https://drive.google.com/uc?id=${idParam}&export=download`,
          preview: `https://drive.google.com/file/d/${idParam}/preview`
        };
      }
      return { direct: input, preview: null };
    } catch {
      return { direct: input, preview: null };
    }
  };
  const drive = deriveDrive(video.video_url);
  const previewSrc = drive?.preview ?? null;
  const src = previewSrc ?? drive?.direct ?? video.video_url ?? '';

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="pt-20 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
              {previewSrc ? (
                <iframe
                  src={previewSrc || undefined}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  referrerPolicy="no-referrer"
                  className="w-full h-full"
                />
              ) : src ? (
                <video
                  src={src}
                  controls
                  playsInline
                  preload="metadata"
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain"
                  poster={video.thumbnail_url || undefined}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No playable link</div>
              )}
              {/* Register a view once per device within cooldown */}
              <RegisterView videoId={video.id} />
            </div>

            {/* Video Info */}
            <div className="mt-4">
              <h1 className="text-xl md:text-2xl font-bold">{video.title}</h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-4">
                <div className="flex items-center gap-4">
                  {video.profile_id ? (
                    <Link prefetch={false} href={`/profile/${video.profile_id}`} className="flex items-center gap-3">
                      <ProfileAvatar
                        profileId={video.profile_id}
                        username={video.profile?.username || null}
                        avatarUrl={video.profile?.avatar_url || null}
                        alt={video.profile?.username || 'Creator'}
                        size={40}
                        className="w-10 h-10"
                      />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base hover:text-red-500 transition-colors">
                          {video.profile?.username || 'Unknown Creator'}
                        </h3>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        username={video.profile?.username || 'Unknown'}
                        avatarUrl={video.profile?.avatar_url || null}
                        alt={video.profile?.username || 'Creator'}
                        size={40}
                        className="w-10 h-10"
                      />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">
                          {video.profile?.username || 'Unknown Creator'}
                        </h3>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ShareButton url={`/watch/${video.id}`} title={video.title} />
                </div>
              </div>

              {/* Description Box */}
              <div className="mt-4 bg-white/5 rounded-xl p-3 text-sm">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <ViewsCount videoId={video.id} initial={video.views || 0} />
                  <span>•</span>
                  <span suppressHydrationWarning>{formatTimeAgo(video.created_at)}</span>
                  {video.category && (
                    <>
                      <span>•</span>
                      <span className="text-red-400">{video.category.name}</span>
                    </>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-gray-300">
                  {video.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Comments removed as requested */}
          </div>

          {/* Sidebar / Related Videos */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold mb-4">Related Videos</h3>
            <div className="flex flex-col gap-4">
              {relatedVideos.map((relatedVideo) => (
                <VideoCard key={relatedVideo.id} video={relatedVideo} />
              ))}
              {relatedVideos.length === 0 && (
                <p className="text-gray-500 text-sm">No related videos found.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
