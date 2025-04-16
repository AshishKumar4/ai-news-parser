'use client';

import { Section } from '@/types';
import { FiBookOpen, FiFileText, FiStar } from 'react-icons/fi';

interface SectionContentProps {
  section: Section;
  summary: string;
  view: 'summary' | 'detailed';
}

export default function SectionContent({ section, summary, view }: SectionContentProps) {
  // If we're in summary view, display a condensed version with just one card
  if (view === 'summary') {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="content-card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiBookOpen className="mr-2 text-green-500" /> {section.title}
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">{section.summary || summary}</p>
          </div>
        </div>
      </div>
    );
  }

  // Detailed view shows full content, section highlights and summary as separate cards
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Section Highlights Card */}
      {section.highlights && section.highlights.length > 0 && (
        <div className="content-card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiStar className="mr-2 text-green-500" /> {section.title} Highlights
          </h2>
          <ul className="list-none space-y-3">
            {section.highlights.map((highlight, index) => (
              <li key={index} className="flex items-baseline">
                <span className="text-green-500 font-bold mr-2">•</span>
                <span>{highlight.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section Content Card */}
      <div className="content-card">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiBookOpen className="mr-2 text-green-500" /> {section.title}
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">{section.content}</p>
        </div>
      </div>

      {/* Section Summary Card */}
      <div className="content-card">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiFileText className="mr-2 text-green-500" /> Summary
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">{section.summary || summary}</p>
        </div>
      </div>
    </div>
  );
}