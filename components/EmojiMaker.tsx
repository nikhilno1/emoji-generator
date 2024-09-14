'use client';
import React, { useState, KeyboardEvent } from 'react';
import EmojiDisplay from './EmojiDisplay';

interface EmojiImage {
  url: string;
  likes: number;
}

const EmojiMaker: React.FC = () => {
  const [emojiImage, setEmojiImage] = useState<string | null>(null);
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
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate emoji');
      }

      const data = await response.json();

      if (data.id) {
        const result = await pollForResult(data.id);
        setEmojiImage(result);
        setRecentEmojis(prev => [{url: result, likes: 0}, ...prev.slice(0, 4)]);
      } else {
        throw new Error('Unexpected response from API');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGenerateEmoji();
    }
  };

  const pollForResult = async (predictionId: string): Promise<string> => {
    const maxAttempts = 30;
    const interval = 2000; // 2 seconds

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, interval));

      const response = await fetch(`/api/check-prediction?id=${predictionId}`);
      if (!response.ok) continue;

      const data = await response.json();

      if (data.status === 'succeeded' && data.output && data.output.length > 0) {
        return data.output[0];
      }

      if (data.status === 'failed') {
        throw new Error('Emoji generation failed');
      }

      if (data.status !== 'processing' && data.status !== 'starting') {
        throw new Error('Unexpected status: ' + data.status);
      }
    }

    throw new Error('Emoji generation timed out');
  };

  const handleLike = (index: number) => {
    setRecentEmojis(prev => 
      prev.map((emoji, i) => 
        i === index ? {...emoji, likes: emoji.likes + 1} : emoji
      )
    );
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