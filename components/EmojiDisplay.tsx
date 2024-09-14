import React from 'react';

interface EmojiImage {
  url: string;
  likes: number;
}

interface EmojiDisplayProps {
  emojiImage: string | null;
  recentEmojis: EmojiImage[];
  onLike: (index: number) => void;
  onDownload: (url: string) => void;
}

const EmojiDisplay: React.FC<EmojiDisplayProps> = ({ emojiImage, recentEmojis, onLike, onDownload }) => {
  return (
    <div className="text-center">
      <div className="mb-6 h-64 w-64 bg-gray-100 rounded-lg flex items-center justify-center shadow-lg mx-auto overflow-hidden">
        {emojiImage ? (
          <img src={emojiImage} alt="Generated Emoji" className="w-full h-full object-contain" />
        ) : (
          <span className="text-4xl text-gray-400">No emoji yet</span>
        )}
      </div>
      {emojiImage && (
        <div className="flex justify-center items-center gap-4 mb-8">
          <button
            onClick={() => onLike(0)}
            className="flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold py-2 px-4 rounded-full transition-colors duration-200"
          >
            <span>❤️</span>
            <span>{recentEmojis[0]?.likes || 0}</span>
          </button>
          <button
            onClick={() => onDownload(emojiImage)}
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
            {recentEmojis.map((emoji, index) => (
              <div key={index} className="text-center">
                <img src={emoji.url} alt={`Recent Emoji ${index + 1}`} className="w-full h-24 object-contain mb-2" />
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => onLike(index)}
                    className="flex items-center gap-1 bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold py-1 px-2 rounded-full transition-colors duration-200 text-sm"
                  >
                    <span>❤️</span>
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