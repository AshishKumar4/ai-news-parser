'use client';

import { StoryHighlight } from '@/types';
import { FiStar, FiFileText } from 'react-icons/fi';

interface StoryHighlightsProps {
  highlights: StoryHighlight[];
  summary: string;
  view?: 'summary' | 'detailed';
}

export default function StoryHighlights({ highlights, summary, view = 'detailed' }: StoryHighlightsProps) {
  // For summary view, show a more compact version with just one card
  if (view === 'summary') {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="content-card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiFileText className="mr-2 text-green-500" /> Article Summary
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">{summary}</p>
          </div>
        </div>
      </div>
    );
  }

  // For detailed view, show highlights and summary as separate cards
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Highlights Card */}
      <div className="content-card">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiStar className="mr-2 text-green-500" /> Story Highlights
        </h2>
        <ul className="list-none space-y-3">
          {highlights.map((highlight, index) => (
            <li key={index} className="flex items-baseline">
              <span className="text-green-500 font-bold mr-2">•</span>
              <span>{highlight.content}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary Card */}
      <div className="content-card">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiFileText className="mr-2 text-green-500" /> Summary
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">{summary}</p>
        </div>
      </div>
    </div>
  );
}