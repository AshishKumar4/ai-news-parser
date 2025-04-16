'use client';

import { ArticleMetadata } from '@/types';
import { FiHelpCircle } from 'react-icons/fi';

interface ArticleHeaderProps {
  metadata: ArticleMetadata;
}

export default function ArticleHeader({ metadata }: ArticleHeaderProps) {
  // Format the date for better display
  const formattedDate = metadata.date ? new Date(metadata.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Unknown date';

  // Create a brief 1-line gist from the description
  const briefGist = metadata.description 
    ? metadata.description.split('. ')[0].trim() 
    : 'No description available';

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold">{metadata.title}</h1>
        {metadata.date && (
          <div className="text-sm text-gray-400 md:text-right animate-slide-in">
            {formattedDate}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 items-center mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {metadata.source && (
          <span className="bg-gray-700 text-sm rounded-full px-3 py-1 transition-all hover:bg-gray-600">
            {metadata.source}
          </span>
        )}
        {metadata.author && (
          <span className="bg-gray-700 text-sm rounded-full px-3 py-1 transition-all hover:bg-gray-600">
            By: {metadata.author}
          </span>
        )}
      </div>
      
      {/* Brief gist of article instead of full summary */}
      <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <p className="text-gray-300 text-lg italic">
          {briefGist}
        </p>
        <span className="text-gray-400 text-sm">— {metadata.author || 'Unknown Author'}</span>
      </div>
    </div>
  );
}