 'use client';
 
 import { useEffect } from 'react';
 import { supabase } from '@/lib/supabase';
 
 export default function SessionSync() {
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
       try {
         await fetch('/api/auth/set-session', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ event, session }),
         });
       } catch {}
     });
     return () => { subscription?.unsubscribe(); };
   }, []);
   return null;
 }
