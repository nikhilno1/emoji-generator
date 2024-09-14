'use client';
import React, { useState, KeyboardEvent, useEffect } from 'react';
import EmojiDisplay from './EmojiDisplay';
import EmojiGrid from './EmojiGrid';
import { getAllEmojis } from '../lib/supabase';

interface EmojiImage {
  id: number;
  url: string;
  likes: number;
  isLiked: boolean;
}

interface EmojiMakerProps {
  userId: string;
}

const EmojiMaker: React.FC<EmojiMakerProps> = ({ userId }) => {
  const [emojiImage, setEmojiImage] = useState<EmojiImage | null>(null);
  const [recentEmojis, setRecentEmojis] = useState<EmojiImage[]>([]);
  const [allEmojis, setAllEmojis] = useState<EmojiImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllEmojis();
  }, [userId]);

  const fetchAllEmojis = async () => {
    try {
      const emojis = await getAllEmojis(userId);
      setAllEmojis(emojis.map(emoji => ({
        id: emoji.id,
        url: emoji.image_url,
        likes: emoji.likes_count,
        isLiked: emoji.isLiked
      })));
    } catch (error) {
      console.error('Error fetching all emojis:', error);
      setError('Failed to fetch emojis');
    }
  };

  const handleGenerateEmoji = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setEmojiImage(null);
    setError(null);

    try {
      const response = await fetch('/api/generate-emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim(), userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate emoji');
      }

      const data = await response.json();
      if (data.imageUrl) {
        setEmojiImage({ id: data.id, url: data.imageUrl, likes: 0, isLiked: false });
        setRecentEmojis(prev => [{ id: data.id, url: data.imageUrl, likes: 0, isLiked: false }, ...prev.slice(0, 4)]);
        
        // Fetch all emojis again to update the grid
        fetchAllEmojis();
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Error generating emoji:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGenerateEmoji();
    }
  };

  const handleLike = async (emojiId: number) => {
    try {
      const response = await fetch('/api/toggle-like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emojiId, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const { likeCount, isLiked } = await response.json();

      setAllEmojis(prev =>
        prev.map(emoji =>
          emoji.id === emojiId
            ? { ...emoji, likes: likeCount, isLiked }
            : emoji
        )
      );

      if (emojiImage && emojiImage.id === emojiId) {
        setEmojiImage({ ...emojiImage, likes: likeCount, isLiked });
      }

      setRecentEmojis(prev =>
        prev.map(emoji =>
          emoji.id === emojiId
            ? { ...emoji, likes: likeCount, isLiked }
            : emoji
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      setError('Failed to update like');
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <EmojiDisplay 
        emojiImage={emojiImage} 
        recentEmojis={recentEmojis}
        onLike={handleLike}
        onDownload={handleDownload}
      />
      <div className="mt-8">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe your emoji..."
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-lg text-gray-800 placeholder-gray-400"
        />
        <button
          onClick={handleGenerateEmoji}
          disabled={isGenerating}
          className={`w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? 'Generating...' : 'Generate Emoji'}
        </button>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
      <h2 className="text-2xl font-bold mt-12 mb-4">All Emojis</h2>
      <EmojiGrid emojis={allEmojis} onLike={handleLike} />
    </div>
  );
};

export default EmojiMaker;