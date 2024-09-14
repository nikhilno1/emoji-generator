import React from 'react';

interface EmojiControlsProps {
  updateEmojiPart: (part: string, value: string) => void;
}

const EmojiControls: React.FC<EmojiControlsProps> = ({ updateEmojiPart }) => {
  const faceOptions = ['😀', '😊', '😐', '😕', '😢', '😍', '😎', '🤔', '😴', '🤯', '🥳', '😇'];
  const eyesOptions = ['', '👀', '🧿', '👁️', '🕶️', '👓', '🥽', '😉', '😑', '😵', '🥺', '😳'];
  const mouthOptions = ['', '👄', '💋', '🦷', '👅', '😃', '😆', '😬', '🤐', '🤢', '🤮', '🤑'];

  return (
    <div className="bg-gray-100 p-6 rounded-xl">
      <EmojiPartSelector
        title="Face"
        options={faceOptions}
        onSelect={(value) => updateEmojiPart('face', value)}
      />
      <EmojiPartSelector
        title="Eyes"
        options={eyesOptions}
        onSelect={(value) => updateEmojiPart('eyes', value)}
      />
      <EmojiPartSelector
        title="Mouth"
        options={mouthOptions}
        onSelect={(value) => updateEmojiPart('mouth', value)}
      />
    </div>
  );
};

interface EmojiPartSelectorProps {
  title: string;
  options: string[];
  onSelect: (value: string) => void;
}

const EmojiPartSelector: React.FC<EmojiPartSelectorProps> = ({ title, options, onSelect }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-6 gap-2">
        {options.map((option, index) => (
          <button
            key={index}
            className="text-2xl bg-white hover:bg-gray-200 rounded-lg w-12 h-12 flex items-center justify-center transition-colors duration-200 shadow"
            onClick={() => onSelect(option)}
          >
            {option || '❌'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiControls;