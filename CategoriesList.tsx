import Link from 'next/link';
import { Database } from '@/types/supabase';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoriesListProps {
  categories: Category[];
}

export default function CategoriesList({ categories }: CategoriesListProps) {
  if (!categories.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide">
      <Link
        prefetch={false}
        href="/"
        className="px-4 py-2 bg-red-600 text-white rounded-lg whitespace-nowrap font-medium hover:bg-red-700 transition-colors"
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          prefetch={false}
          href={`/category/${category.slug || category.id}`}
          className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg whitespace-nowrap font-medium hover:bg-white/20 hover:text-white transition-colors"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
