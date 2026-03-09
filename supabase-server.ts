import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export const createClient = async () => {
  const cookieStore = await cookies();
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      async get(name: string) {
        return (await cookieStore).get(name)?.value;
      },
      async set(name: string, value: string, options: Record<string, unknown>) {
        (await cookieStore).set({ name, value, ...(options as Record<string, unknown>) });
      },
      async remove(name: string, options: Record<string, unknown>) {
        (await cookieStore).set({ name, value: '', expires: new Date(0), ...(options as Record<string, unknown>) });
      },
    },
  });
};
