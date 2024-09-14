import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function uploadEmojiToSupabase(imageUrl: string, userId: string, prompt: string) {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Generate a unique file name
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.png`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('emojis')
      .upload(fileName, blob);

    if (uploadError) throw uploadError;

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('emojis')
      .getPublicUrl(fileName);

    // Insert record into emojis table
    const { data: insertData, error: insertError } = await supabase
      .from('emojis')
      .insert({
        image_url: publicUrl,
        prompt: prompt,
        creator_user_id: userId,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return { data: insertData, error: null };
  } catch (error) {
    console.error('Error uploading emoji:', error);
    return { data: null, error };
  }
}