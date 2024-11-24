import React from 'react';
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, Link } from 'lucide-react';

type FormattingButtonsProps = {
  onFormat: (type: 'bold' | 'italic' | 'underline' | 'link', formattedText: string) => void;
  selectedText: string;
};

export default function FormattingButtons({ onFormat, selectedText }: FormattingButtonsProps) {
  const handleFormat = (type: 'bold' | 'italic' | 'underline' | 'link') => {
    let formattedText = '';
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `_${selectedText}_`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
    }
    onFormat(type, formattedText);
  };

  return (
    <div className="flex space-x-2 mb-2">
      <Button variant="outline" size="sm" onClick={() => handleFormat('bold')}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleFormat('italic')}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleFormat('underline')}>
        <Underline className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleFormat('link')}>
        <Link className="h-4 w-4" />
      </Button>
    </div>
  );
}

