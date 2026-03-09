export const MOCK_CATEGORIES = [
  { id: '1', name: 'Action', slug: 'action' },
  { id: '2', name: 'Comedy', slug: 'comedy' },
  { id: '3', name: 'Drama', slug: 'drama' },
  { id: '4', name: 'Gaming', slug: 'gaming' },
  { id: '5', name: 'Music', slug: 'music' },
  { id: '6', name: 'Tech', slug: 'tech' },
];

export const MOCK_VIDEOS = [
  {
    id: '1',
    title: 'Epic Gameplay Moments #1',
    description: 'The best gaming moments of the week! Watch as pro players demonstrate incredible skill and strategy in this compilation.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    duration: 185,
    views: 12500,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    category: { name: 'Gaming' },
    profile: { username: 'GameMaster', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
    category_id: '4',
    profile_id: 'p1'
  },
  {
    id: '2',
    title: 'Top 10 Coding Tips for 2026',
    description: 'Learn the latest trends in software development and how to stay ahead in your career.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    duration: 640,
    views: 8900,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    category: { name: 'Tech' },
    profile: { username: 'CodeNinja', avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&q=80' },
    category_id: '6',
    profile_id: 'p2'
  },
  {
    id: '3',
    title: 'Relaxing Lo-Fi Beats',
    description: 'Chill music to study and relax to. Perfect for late night coding sessions.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    duration: 3600,
    views: 45000,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    category: { name: 'Music' },
    profile: { username: 'LoFiGirl', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
    category_id: '5',
    profile_id: 'p3'
  },
  {
    id: '4',
    title: 'Funny Cat Compilation',
    description: 'Try not to laugh challenge! The funniest cats on the internet.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
    duration: 420,
    views: 150000,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    category: { name: 'Comedy' },
    profile: { username: 'CatLover', avatar_url: null },
    category_id: '2',
    profile_id: 'p4'
  },
  {
    id: '5',
    title: 'Nature Documentary: The Forest',
    description: 'Explore the hidden life of the forest in this stunning documentary.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    duration: 1200,
    views: 3200,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    category: { name: 'Drama' },
    profile: { username: 'NatureDoc', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
    category_id: '3',
    profile_id: 'p5'
  },
  {
    id: '6',
    title: 'Action Movie Trailer',
    description: 'Check out the trailer for the upcoming blockbuster movie.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    duration: 150,
    views: 500000,
    created_at: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    category: { name: 'Action' },
    profile: { username: 'MovieBuff', avatar_url: null },
    category_id: '1',
    profile_id: 'p6'
  }
];

export const MOCK_COMMENTS = [
  {
    id: 'c1',
    content: 'This is amazing! Thanks for sharing.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user: { username: 'Viewer1', avatar_url: null }
  },
  {
    id: 'c2',
    content: 'Great quality video, subscribed!',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user: { username: 'FanBoy', avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80' }
  }
];
