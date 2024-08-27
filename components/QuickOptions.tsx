import React from 'react';

interface QuickOptionsProps {
  options: string[];
  onOptionClick: (option: string) => void;
}

const QuickOptions: React.FC<QuickOptionsProps> = ({ options, onOptionClick }) => {
  return (
    <div className="flex mt-4">
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-md px-3 py-1 text-sm cursor-pointer hover:bg-gray-300"
            onClick={() => onOptionClick(option)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickOptions;