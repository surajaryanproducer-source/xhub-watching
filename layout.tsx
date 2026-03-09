import Link from 'next/link';
import { Home, Upload, Video, List, LogOut, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // We need to check headers to know the current path and avoid infinite redirect loop
  // But strictly speaking, the redirect logic should be in the page components or middleware
  // Let's remove the redirect here and let individual pages handle it, or use middleware.
  // For now, removing the redirect fixes the loop.
  // The sidebar is now conditionally rendered based on session.
  
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      {session && (
      <aside className="w-64 bg-gray-900 border-r border-white/10 hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="font-bold text-xl tracking-wider">ADMIN</span>
          </Link>

          <nav className="space-y-2">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/dashboard?tab=upload"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Video</span>
            </Link>
            <Link
              href="/admin/dashboard?tab=videos"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Video className="w-5 h-5" />
              <span>Manage Videos</span>
            </Link>
            <Link
              href="/admin/dashboard?tab=categories"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <List className="w-5 h-5" />
              <span>Manage Categories</span>
            </Link>
            <Link
              href="/admin/dashboard?tab=profiles"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Manage Profiles</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition-colors w-full">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {session && (
        <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 md:hidden">
          <span className="font-bold">Admin Panel</span>
          {/* Mobile menu button could go here */}
        </header>
        )}
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
