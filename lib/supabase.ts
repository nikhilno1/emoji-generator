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
    const { error: uploadError } = await supabase.storage
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

    return { data: { ...insertData, likes: 0, isLiked: false }, error: null };
  } catch (error) {
    console.error('Error uploading emoji:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
}

export async function toggleEmojiLike(emojiId: number, userId: string) {
  // Check if the user has already liked this emoji
  const { data: existingLike, error: fetchError } = await supabase
    .from('emoji_likes')
    .select()
    .eq('emoji_id', emojiId)
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching like:', fetchError);
    throw fetchError;
  }

  if (existingLike) {
    // Unlike: Remove the like
    const { error: deleteError } = await supabase
      .from('emoji_likes')
      .delete()
      .eq('emoji_id', emojiId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error unliking emoji:', deleteError);
      throw deleteError;
    }
  } else {
    // Like: Add a new like
    const { error: insertError } = await supabase
      .from('emoji_likes')
      .insert({ emoji_id: emojiId, user_id: userId });

    if (insertError) {
      console.error('Error liking emoji:', insertError);
      throw insertError;
    }
  }

  // Get updated like count
  const { count, error: countError } = await supabase
    .from('emoji_likes')
    .select('*', { count: 'exact', head: true })
    .eq('emoji_id', emojiId);

  if (countError) {
    console.error('Error getting like count:', countError);
    throw countError;
  }

  // Update the likes_count in the emojis table
  const { error: updateError } = await supabase
    .from('emojis')
    .update({ likes_count: count })
    .eq('id', emojiId);

  if (updateError) {
    console.error('Error updating emoji likes count:', updateError);
    throw updateError;
  }

  return { likeCount: count || 0, isLiked: !existingLike };
}

export async function getAllEmojis(userId: string) {
  const { data, error } = await supabase
    .from('emojis')
    .select(`
      *,
      emoji_likes!left(user_id)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching emojis:', error);
    throw error;
  }

  return data.map(emoji => ({
    id: emoji.id,
    image_url: emoji.image_url,
    likes_count: emoji.likes_count,
    isLiked: emoji.emoji_likes.some((like: { user_id: string }) => like.user_id === userId)
  }));
}