import { NextResponse } from 'next/server';
import { toggleEmojiLike } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { emojiId, userId } = await request.json();

    if (!emojiId || !userId) {
      return NextResponse.json({ message: 'Emoji ID and User ID are required' }, { status: 400 });
    }

    const { likeCount, isLiked } = await toggleEmojiLike(emojiId, userId);

    return NextResponse.json({ likeCount, isLiked });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { message: 'Error toggling like', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}