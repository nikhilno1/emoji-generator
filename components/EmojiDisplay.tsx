import React from 'react';
import Image from 'next/image';

interface EmojiImage {
  id: number;
  url: string;
  likes: number;
  isLiked: boolean;
}

interface EmojiDisplayProps {
  emojiImage: EmojiImage | null;
  recentEmojis: EmojiImage[];
  onLike: (id: number) => void;
  onDownload: (url: string) => void;
}

const EmojiDisplay: React.FC<EmojiDisplayProps> = ({ emojiImage, recentEmojis, onLike, onDownload }) => {
  return (
    <div className="text-center">
      <div className="mb-6 h-64 w-64 bg-gray-100 rounded-lg flex items-center justify-center shadow-lg mx-auto overflow-hidden">
        {emojiImage ? (
          <Image 
            src={emojiImage.url} 
            alt="Generated Emoji" 
            width={256} 
            height={256} 
            className="object-contain" 
          />
        ) : (
          <span className="text-4xl text-gray-400">No emoji yet</span>
        )}
      </div>
      {emojiImage && (
        <div className="flex justify-center items-center gap-4 mb-8">
          <button
            onClick={() => onLike(emojiImage.id)}
            className={`flex items-center gap-2 ${
              emojiImage.isLiked ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-800'
            } hover:bg-pink-200 font-bold py-2 px-4 rounded-full transition-colors duration-200`}
          >
            <span>{emojiImage.isLiked ? '❤️' : '🤍'}</span>
            <span>{emojiImage.likes}</span>
          </button>
          <button
            onClick={() => onDownload(emojiImage.url)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
          >
            Download
          </button>
        </div>
      )}
      {recentEmojis.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Recently Generated</h2>
          <div className="grid grid-cols-3 gap-4">
            {recentEmojis.map((emoji) => (
              <div key={emoji.id} className="text-center">
                <Image 
                  src={emoji.url} 
                  alt={`Recent Emoji`} 
                  width={96} 
                  height={96} 
                  className="object-contain mb-2" 
                />
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => onLike(emoji.id)}
                    className={`flex items-center gap-1 ${
                      emoji.isLiked ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-800'
                    } hover:bg-pink-200 font-bold py-1 px-2 rounded-full transition-colors duration-200 text-sm`}
                  >
                    <span>{emoji.isLiked ? '❤️' : '🤍'}</span>
                    <span>{emoji.likes}</span>
                  </button>
                  <button
                    onClick={() => onDownload(emoji.url)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded-full transition-colors duration-200 text-sm"
                  >
                    ⬇️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiDisplay;