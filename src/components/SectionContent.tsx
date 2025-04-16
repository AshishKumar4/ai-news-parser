'use client';

import { Section } from '@/types';
import { FiBookOpen, FiFileText, FiStar } from 'react-icons/fi';

interface SectionContentProps {
  section: Section;
  summary: string;
  view: 'summary' | 'detailed';
}

export default function SectionContent({ section, summary, view }: SectionContentProps) {
  // Safely handle nullish values
  const sectionContent = section?.content || 'No content available';
  const sectionSummary = section?.summary || summary || 'No summary available';
  const sectionHighlights = section?.highlights || [];
  
  // Generate the section ID for ARIA linking with tabs
  const sectionId = section?.id || 'section-content';
  
  // If we're in summary view, display a condensed version with just one card
  if (view === 'summary') {
    return (
      <div 
        id={`${sectionId}-content`}
        role="tabpanel"
        aria-labelledby={`tab-${sectionId}`}
        className="space-y-4 animate-fade-in transition-all"
        tabIndex={0}
      >
        <div className="content-card animate-scale-in">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiBookOpen className="mr-2 text-green-500" aria-hidden="true" /> {section.title}
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">{sectionSummary}</p>
          </div>
        </div>
      </div>
    );
  }

  // Detailed view shows full content, section highlights and summary as separate cards
  return (
    <div 
      id={`${sectionId}-content`}
      role="tabpanel"
      aria-labelledby={`tab-${sectionId}`}
      className="space-y-4 animate-fade-in transition-all"
      tabIndex={0}
    >
      {/* Section Highlights Card */}
      {sectionHighlights.length > 0 && (
        <div className="content-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiStar className="mr-2 text-green-500" aria-hidden="true" /> {section.title} Highlights
          </h2>
          <ul className="list-none space-y-3 stagger-children" aria-label={`${section.title} highlights`}>
            {sectionHighlights.map((highlight, index) => (
              <li key={index} className="flex items-baseline">
                <span className="text-green-500 font-bold mr-2" aria-hidden="true">•</span>
                <span>{highlight.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section Content Card */}
      <div className="content-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiBookOpen className="mr-2 text-green-500" aria-hidden="true" /> {section.title} Details
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">{sectionContent}</p>
        </div>
      </div>

      {/* Section Summary Card */}
      <div className="content-card animate-scale-in" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiFileText className="mr-2 text-green-500" aria-hidden="true" /> Summary
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">{sectionSummary}</p>
        </div>
      </div>
    </div>
  );
}