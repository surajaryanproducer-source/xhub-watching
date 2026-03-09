import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: Request) {
  const body = await req.json()
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      async get(name: string) {
        return (await cookieStore).get(name)?.value
      },
      async set(name: string, value: string, options: Record<string, unknown>) {
        (await cookieStore).set({ name, value, ...(options as Record<string, unknown>) })
      },
      async remove(name: string, options: Record<string, unknown>) {
        (await cookieStore).set({ name, value: '', expires: new Date(0), ...(options as Record<string, unknown>) })
      },
    },
  })

  const { event, session } = body || {}

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    await supabase.auth.setSession(session)
  }
  if (event === 'SIGNED_OUT') {
    await supabase.auth.signOut()
  }

  return NextResponse.json({ ok: true })
}
