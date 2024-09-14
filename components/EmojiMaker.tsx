'use client';
import React, { useState, KeyboardEvent } from 'react';
import EmojiDisplay from './EmojiDisplay';

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
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      setRecentEmojis(prev =>
        prev.map(emoji =>
          emoji.id === emojiId
            ? { ...emoji, likes: likeCount, isLiked }
            : emoji
        )
      );

      if (emojiImage && emojiImage.id === emojiId) {
        setEmojiImage({ ...emojiImage, likes: likeCount, isLiked });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setError('Failed to update like');
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-md mx-auto">
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
    </div>
  );
};

export default EmojiMaker;