import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-project-id') &&
  supabaseUrl.startsWith('https://')
);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 */
export async function uploadToSupabaseStorage(
  bucketName: 'avatars' | 'payments' | 'tournaments',
  filePath: string,
  file: File | Blob
): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
    );
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '3600',
    });

  if (error) {
    console.error(`Supabase Storage upload error [${bucketName}/${filePath}]:`, error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
