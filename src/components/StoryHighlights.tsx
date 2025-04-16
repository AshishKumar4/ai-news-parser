'use client';

import { StoryHighlight } from '@/types';
import { FiStar, FiFileText } from 'react-icons/fi';

interface StoryHighlightsProps {
  highlights: StoryHighlight[];
  summary: string;
  view?: 'summary' | 'detailed';
}

export default function StoryHighlights({ highlights, summary, view = 'detailed' }: StoryHighlightsProps) {
  // Handle potential empty data gracefully
  const articleHighlights = highlights || [];
  const articleSummary = summary || 'No summary available';

  // For summary view, show a more compact version with just one card
  if (view === 'summary') {
    return (
      <div 
        id="highlights-content"
        role="tabpanel" 
        aria-labelledby="tab-highlights"
        className="space-y-4 animate-fade-in transition-all"
        tabIndex={0}
      >
        <div className="content-card animate-scale-in">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiFileText className="mr-2 text-green-500" aria-hidden="true" /> Article Summary
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">{articleSummary}</p>
          </div>
        </div>
      </div>
    );
  }

  // For detailed view, show highlights and summary as separate cards
  return (
    <div 
      id="highlights-content"
      role="tabpanel" 
      aria-labelledby="tab-highlights"
      className="space-y-4 animate-fade-in transition-all"
      tabIndex={0}
    >
      {/* Highlights Card */}
      {articleHighlights.length > 0 && (
        <div className="content-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiStar className="mr-2 text-green-500" aria-hidden="true" /> Story Highlights
          </h2>
          <ul className="list-none space-y-3 stagger-children" aria-label="Key article highlights">
            {articleHighlights.map((highlight, index) => (
              <li key={index} className="flex items-baseline">
                <span className="text-green-500 font-bold mr-2" aria-hidden="true">•</span>
                <span>{highlight.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary Card */}
      <div className="content-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiFileText className="mr-2 text-green-500" aria-hidden="true" /> Summary
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">{articleSummary}</p>
        </div>
      </div>
    </div>
  );
}