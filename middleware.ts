import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          res.cookies.set({ name, value, ...(options as Record<string, unknown>) })
        },
        remove(name: string, options: Record<string, unknown>) {
          res.cookies.set({ name, value: '', expires: new Date(0), ...(options as Record<string, unknown>) })
        },
      },
    })

    void supabase.auth.getSession()
  } catch {}

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
