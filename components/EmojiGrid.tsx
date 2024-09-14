'use client';

import React from 'react';
import Image from 'next/image';

interface EmojiImage {
  id: number;
  url: string;
  likes: number;
  isLiked: boolean;
}

interface EmojiGridProps {
  emojis: EmojiImage[];
  onLike: (id: number) => void;
}

const EmojiGrid: React.FC<EmojiGridProps> = ({ emojis, onLike }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {emojis.map((emoji) => (
        <div key={emoji.id} className="relative">
          <Image
            src={emoji.url}
            alt="Emoji"
            width={100}
            height={100}
            className="rounded-lg"
          />
          <button
            onClick={() => onLike(emoji.id)}
            className={`absolute bottom-2 right-2 rounded-full p-1 ${
              emoji.isLiked ? 'bg-pink-500 text-white' : 'bg-white text-pink-500'
            }`}
          >
            {emoji.isLiked ? '❤️' : '🤍'} {emoji.likes}
          </button>
        </div>
      ))}
    </div>
  );
};

export default EmojiGrid;