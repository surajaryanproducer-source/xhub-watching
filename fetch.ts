import { createClient } from './supabase-server';

export async function getCategories() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getLatestVideos() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profile:profiles(username, avatar_url),
        category:categories(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    let rows: any[] = data || [];
    const missingIds = Array.from(new Set(
      rows
        .filter((v: any) => v.profile_id && (!v.profile || !v.profile.avatar_url || !v.profile.username))
        .map((v: any) => v.profile_id)
    ));
    if (missingIds.length) {
      const { data: profs } = await supabase.from('profiles').select('*').in('id', missingIds);
      const map = new Map<string, any>();
      (profs || []).forEach((p: any) => map.set(p.id, p));
      rows = rows.map((v: any) => {
        if ((!v.profile || !v.profile.username) && v.profile_id) {
          const p = map.get(v.profile_id);
          if (p) {
            return {
              ...v,
              profile: {
                username: p.username ?? p.name ?? 'Unknown',
                avatar_url: p.avatar_url ?? p.profile_image ?? null,
              },
            };
          }
        }
        return {
          ...v,
          profile: v.profile
            ? { ...v.profile, username: v.profile.username || 'Unknown' }
            : { username: 'Unknown', avatar_url: null },
        };
      });
    } else {
      rows = rows.map((v: any) => ({
        ...v,
        profile: v.profile
          ? { ...v.profile, username: v.profile.username || 'Unknown' }
          : { username: 'Unknown', avatar_url: null },
      }));
    }
    // Additional enrichment by username/name when no profile_id
    const missingNames = Array.from(new Set(rows
      .filter((v: any) => (!v.profile || !v.profile.avatar_url) && !v.profile_id && v.profile?.username)
      .map((v: any) => v.profile.username)));
    if (missingNames.length) {
      const [byUsername, byName] = await Promise.all([
        supabase.from('profiles').select('*').in('username', missingNames),
        supabase.from('profiles').select('*').in('name', missingNames),
      ]);
      const nameMap = new Map<string, any>();
      (byUsername.data || []).forEach((p: any) => nameMap.set(p.username, p));
      (byName.data || []).forEach((p: any) => nameMap.set(p.name, p));
      rows = rows.map((v: any) => {
        if ((!v.profile || !v.profile.avatar_url) && !v.profile_id && v.profile?.username) {
          const p = nameMap.get(v.profile.username);
          if (p) {
            return {
              ...v,
              profile: {
                username: v.profile.username,
                avatar_url: p.avatar_url ?? p.profile_image ?? null,
              },
            };
          }
        }
        return v;
      });
    }
    return rows;
  } catch (error) {
    // Fallback for schema without FKs/relationships: read flat columns
    try {
      const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(10);
      const list = (data || []).map((v: any) => ({
        id: v.id,
        title: v.title,
        video_url: v.video_url,
        thumbnail_url: v.thumbnail_url ?? v.thumbnail ?? null,
        duration: v.duration ?? 0,
        views: v.views ?? 0,
        created_at: v.created_at,
        category: v.category ? { name: v.category } : null,
        profile: { username: v.profile || 'Unknown', avatar_url: null },
      }));
      return list;
    } catch {
      return [];
    }
  }
}

export async function getTrendingVideos() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profile:profiles(username, avatar_url),
        category:categories(name)
      `)
      .eq('is_trending', true)
      .order('created_at', { ascending: false })
      .limit(12);
    if (error) throw error;
    if (data && data.length > 0) {
      let rows: any[] = data;
      const missingIds = Array.from(new Set(
        rows
          .filter((v: any) => v.profile_id && (!v.profile || !v.profile.avatar_url || !v.profile.username))
          .map((v: any) => v.profile_id)
      ));
      if (missingIds.length) {
        const { data: profs } = await supabase.from('profiles').select('*').in('id', missingIds);
        const map = new Map<string, any>();
        (profs || []).forEach((p: any) => map.set(p.id, p));
        rows = rows.map((v: any) => {
          if ((!v.profile || !v.profile.username) && v.profile_id) {
            const p = map.get(v.profile_id);
            if (p) {
              return {
                ...v,
                profile: {
                  username: p.username ?? p.name ?? 'Unknown',
                  avatar_url: p.avatar_url ?? p.profile_image ?? null,
                },
              };
            }
          }
          return {
            ...v,
            profile: v.profile
              ? { ...v.profile, username: v.profile.username || 'Unknown' }
              : { username: 'Unknown', avatar_url: null },
          };
        });
      } else {
        rows = rows.map((v: any) => ({
          ...v,
          profile: v.profile
            ? { ...v.profile, username: v.profile.username || 'Unknown' }
            : { username: 'Unknown', avatar_url: null },
        }));
      }
      // Additional enrichment by username/name when no profile_id
      const missingNames = Array.from(new Set(rows
        .filter((v: any) => (!v.profile || !v.profile.avatar_url) && !v.profile_id && v.profile?.username)
        .map((v: any) => v.profile.username)));
      if (missingNames.length) {
        const [byUsername, byName] = await Promise.all([
          supabase.from('profiles').select('*').in('username', missingNames),
          supabase.from('profiles').select('*').in('name', missingNames),
        ]);
        const nameMap = new Map<string, any>();
        (byUsername.data || []).forEach((p: any) => nameMap.set(p.username, p));
        (byName.data || []).forEach((p: any) => nameMap.set(p.name, p));
        rows = rows.map((v: any) => {
          if ((!v.profile || !v.profile.avatar_url) && !v.profile_id && v.profile?.username) {
            const p = nameMap.get(v.profile.username);
            if (p) {
              return {
                ...v,
                profile: {
                  username: v.profile.username,
                  avatar_url: p.avatar_url ?? p.profile_image ?? null,
                },
              };
            }
          }
          return v;
        });
      }
      return rows;
    }

    const { data: byViews, error: viewsErr } = await supabase
      .from('videos')
      .select(`
        *,
        profile:profiles(username, avatar_url),
        category:categories(name)
      `)
      .order('views', { ascending: false })
      .limit(12);
    if (viewsErr) throw viewsErr;
    let rows: any[] = byViews || [];
    const missingIds = Array.from(new Set(
      rows
        .filter((v: any) => v.profile_id && (!v.profile || !v.profile.avatar_url || !v.profile.username))
        .map((v: any) => v.profile_id)
    ));
    if (missingIds.length) {
      const { data: profs } = await supabase.from('profiles').select('*').in('id', missingIds);
      const map = new Map<string, any>();
      (profs || []).forEach((p: any) => map.set(p.id, p));
      rows = rows.map((v: any) => {
        if ((!v.profile || !v.profile.username) && v.profile_id) {
          const p = map.get(v.profile_id);
          if (p) {
            return {
              ...v,
              profile: {
                username: p.username ?? p.name ?? 'Unknown',
                avatar_url: p.avatar_url ?? p.profile_image ?? null,
              },
            };
          }
        }
        return {
          ...v,
          profile: v.profile
            ? { ...v.profile, username: v.profile.username || 'Unknown' }
            : { username: 'Unknown', avatar_url: null },
        };
      });
    } else {
      rows = rows.map((v: any) => ({
        ...v,
        profile: v.profile
          ? { ...v.profile, username: v.profile.username || 'Unknown' }
          : { username: 'Unknown', avatar_url: null },
      }));
    }
    return rows;
  } catch (error) {
    // Fallback: simple select without joins
    try {
      const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(12);
      const primaries = (data || []).filter((v: any) => v.is_trending);
      const listBase = (primaries.length > 0 ? primaries : (data || []).sort((a: any, b: any) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 12)).map((v: any) => ({
        id: v.id,
        title: v.title,
        video_url: v.video_url,
        thumbnail_url: v.thumbnail_url ?? v.thumbnail ?? null,
        duration: v.duration ?? 0,
        views: v.views ?? 0,
        created_at: v.created_at,
        category: v.category ? { name: v.category } : null,
        profile: { username: v.profile || 'Unknown', avatar_url: null },
      }));
      return listBase;
    } catch {
      return [];
    }
  }
}

export async function getFeaturedVideos() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('featured_videos')
      .select(`
        display_order,
        video:videos(
          *,
          profile:profiles(username, avatar_url),
          category:categories(name)
        )
      `)
      .order('display_order');
    if (error) throw error;
    // @ts-ignore
    const vids = data?.map(item => item.video).filter((v: any) => v != null) || [];
    const list = vids.map((v: any) => ({
      ...v,
      profile: v.profile
        ? { ...v.profile, username: v.profile.username || 'Unknown' }
        : { username: 'Unknown', avatar_url: null },
    }));
    return list;
  } catch (error) {
    return [];
  }
}

export async function getVideo(id: string) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profile:profiles(*),
        category:categories(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as any;
  } catch (error) {
    // Fallback without joins (flat schema)
    try {
      const { data } = await supabase
        .from('videos')
        .select('id, title, description, video_url, thumbnail_url, thumbnail, category, profile, views, created_at, category_id, profile_id')
        .eq('id', id)
        .single();
      if (!data) return null as any;
      // Try to enrich from profile/category tables if ids exist
      let prof: any = null;
      if ((data as any).profile_id) {
        const p = await supabase.from('profiles').select('*').eq('id', (data as any).profile_id).single();
        if (!p.error && p.data) {
          const pd: any = p.data as any;
          prof = {
            username: pd.username ?? pd.name ?? 'Unknown',
            avatar_url: pd.avatar_url ?? pd.profile_image ?? null,
          };
        }
      }
      let cat: any = null;
      if ((data as any).category_id) {
        const c = await supabase.from('categories').select('name').eq('id', (data as any).category_id).single();
        if (!c.error && c.data) {
          cat = { name: c.data.name };
        }
      }
      const mapped: any = {
        id: (data as any).id,
        title: (data as any).title,
        description: (data as any).description,
        video_url: (data as any).video_url,
        thumbnail_url: (data as any).thumbnail_url ?? (data as any).thumbnail ?? null,
        views: (data as any).views ?? 0,
        created_at: (data as any).created_at,
        category_id: (data as any).category_id ?? null,
        profile_id: (data as any).profile_id ?? null,
        category: cat ?? ((data as any).category ? { name: (data as any).category } : null),
        profile: prof ?? { username: (data as any).profile || 'Unknown', avatar_url: null },
      };
      return mapped as any;
    } catch {
      return null as any;
    }
  }
}

export async function getRelatedVideos(categoryId: string, currentVideoId: string) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profile:profiles(username, avatar_url),
        category:categories(name)
      `)
      .eq('category_id', categoryId)
      .neq('id', currentVideoId)
      .limit(8);
    if (error) throw error;
    let rows: any[] = data || [];
    const missingIds = Array.from(new Set(
      rows
        .filter((v: any) => v.profile_id && (!v.profile || !v.profile.avatar_url || !v.profile.username))
        .map((v: any) => v.profile_id)
    ));
    if (missingIds.length) {
      const { data: profs } = await supabase.from('profiles').select('*').in('id', missingIds);
      const map = new Map<string, any>();
      (profs || []).forEach((p: any) => map.set(p.id, p));
      rows = rows.map((v: any) => {
        if ((!v.profile || !v.profile.username) && v.profile_id) {
          const p = map.get(v.profile_id);
          if (p) {
            return {
              ...v,
              profile: {
                username: p.username ?? p.name ?? 'Unknown',
                avatar_url: p.avatar_url ?? p.profile_image ?? null,
              },
            };
          }
        }
        return {
          ...v,
          profile: v.profile
            ? { ...v.profile, username: v.profile.username || 'Unknown' }
            : { username: 'Unknown', avatar_url: null },
        };
      });
    } else {
      rows = rows.map((v: any) => ({
        ...v,
        profile: v.profile
          ? { ...v.profile, username: v.profile.username || 'Unknown' }
          : { username: 'Unknown', avatar_url: null },
      }));
    }
    return rows as any[];
  } catch (error) {
    return [];
  }
}

export async function getProfilesWithCounts() {
  const supabase = await createClient();
  try {
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .order('username', { ascending: true });
    if (pErr) throw pErr;

    const { data: vids, error: vErr } = await supabase
      .from('videos')
      .select('id, profile_id');
    if (vErr) throw vErr;

    const counts = new Map<string, number>();
    (vids || []).forEach(v => {
      if (!v.profile_id) return;
      counts.set(v.profile_id, (counts.get(v.profile_id) || 0) + 1);
    });

    return (profiles || []).map((p: any) => {
      const name = p.username ?? p.name ?? 'Unknown';
      const avatar_url = p.avatar_url ?? p.profile_image ?? null;
      return {
        id: p.id,
        name,
        avatar_url,
        videos_count: counts.get(p.id) || 0,
      };
    });
  } catch (e) {
    // Fallback when profiles table not accessible: derive from videos table
    try {
      const { data } = await supabase.from('videos').select('profile').order('created_at', { ascending: false });
      const counts = new Map<string, number>();
      (data || []).forEach((v: any) => {
        const key = v.profile || 'Unknown';
        counts.set(key, (counts.get(key) || 0) + 1);
      });
      const derived = Array.from(counts.entries()).map(([name, cnt], idx) => ({
        id: `derived-${idx}`,
        name,
        avatar_url: null,
        videos_count: cnt,
      }));
      return derived as any[];
    } catch {
      return [] as any[];
    }
  }
}

export async function countVideosByProfile(profileId: string) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('id', { count: 'exact' })
      .eq('profile_id', profileId);
    if (error) throw error;
    return data?.length || 0;
  } catch (e) {
    return 0;
  }
}

export async function getComments(videoId: string) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(username, avatar_url)
      `)
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as any[];
  } catch (error) {
    return [];
  }
}

export async function searchVideos(query: string) {
  const supabase = await createClient();
  try {
    const term = (query || '').trim();
    if (!term) return [];
    // Run two ilike queries and merge, avoiding .or string pitfalls with commas/special chars
    const selectClause = `
        *,
        profile:profiles(username, avatar_url),
        category:categories(name)
      `;
    const [byTitle, byDesc] = await Promise.all([
      supabase.from('videos').select(selectClause).ilike('title', `%${term}%`).limit(20),
      supabase.from('videos').select(selectClause).ilike('description', `%${term}%`).limit(20),
    ]);
    let rows: any[] = [];
    if (!(byTitle.error && byDesc.error)) {
      const merged = new Map<string, any>();
      (byTitle.data || []).forEach((v: any) => merged.set(v.id, v));
      (byDesc.data || []).forEach((v: any) => merged.set(v.id, v));
      rows = Array.from(merged.values());
    }
    // Fallback without joins when relationships are missing or results empty
    if (rows.length === 0 || (byTitle.error && byDesc.error)) {
      const [ftTitle, ftDesc] = await Promise.all([
        supabase.from('videos').select('*').ilike('title', `%${term}%`).limit(20),
        supabase.from('videos').select('*').ilike('description', `%${term}%`).limit(20),
      ]);
      const merged = new Map<string, any>();
      (ftTitle.data || []).forEach((v: any) => merged.set(v.id, v));
      (ftDesc.data || []).forEach((v: any) => merged.set(v.id, v));
      rows = Array.from(merged.values()).map((v: any) => ({
        ...v,
        profile: v.profile ? { username: v.profile } : undefined,
        category: v.category ? { name: v.category } : undefined,
      }));
      // Enrich with profile/category tables if ids exist
      const missingProfileIds = Array.from(new Set(rows.filter(v => (!v.profile || !v.profile.username) && v.profile_id).map(v => v.profile_id)));
      const missingCategoryIds = Array.from(new Set(rows.filter(v => (!v.category || !v.category.name) && v.category_id).map(v => v.category_id)));
      if (missingProfileIds.length) {
        const profs = await supabase.from('profiles').select('*').in('id', missingProfileIds);
        const pmap = new Map<string, any>();
        (profs.data || []).forEach((p:any)=> pmap.set(p.id, p));
        rows = rows.map(v=>{
          if ((!v.profile || !v.profile.username) && v.profile_id) {
            const p = pmap.get(v.profile_id);
            if (p) {
              return { ...v, profile: { username: p.username ?? p.name ?? 'Unknown', avatar_url: p.avatar_url ?? p.profile_image ?? null } };
            }
          }
          return v;
        });
      }
      if (missingCategoryIds.length) {
        const cats = await supabase.from('categories').select('*').in('id', missingCategoryIds);
        const cmap = new Map<string, any>();
        (cats.data || []).forEach((c:any)=> cmap.set(c.id, c));
        rows = rows.map(v=>{
          if ((!v.category || !v.category.name) && v.category_id) {
            const c = cmap.get(v.category_id);
            if (c) {
              return { ...v, category: { name: c.name } };
            }
          }
          return v;
        });
      }
    }
    // Sort by views desc as a simple relevance
    rows.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    const missingIds = Array.from(new Set(
      rows
        .filter((v: any) => v.profile_id && (!v.profile || !v.profile.avatar_url || !v.profile.username))
        .map((v: any) => v.profile_id)
    ));
    if (missingIds.length) {
      const { data: profs } = await supabase.from('profiles').select('*').in('id', missingIds);
      const map = new Map<string, any>();
      (profs || []).forEach((p: any) => map.set(p.id, p));
      rows = rows.map((v: any) => {
        if ((!v.profile || !v.profile.username) && v.profile_id) {
          const p = map.get(v.profile_id);
          if (p) {
            return {
              ...v,
              profile: {
                username: p.username ?? p.name ?? 'Unknown',
                avatar_url: p.avatar_url ?? p.profile_image ?? null,
              },
            };
          }
        }
        return {
          ...v,
          profile: v.profile
            ? { ...v.profile, username: v.profile.username || 'Unknown' }
            : { username: 'Unknown', avatar_url: null },
        };
      });
    } else {
      rows = rows.map((v: any) => ({
        ...v,
        profile: v.profile
          ? { ...v.profile, username: v.profile.username || 'Unknown' }
          : { username: 'Unknown', avatar_url: null },
      }));
    }
    return rows;
  } catch (error) {
    return [];
  }
}
