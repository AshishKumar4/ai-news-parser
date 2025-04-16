'use client';

import { Section } from '@/types';
import { KeyboardEvent } from 'react';

interface SidebarProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function Sidebar({ sections, activeSection, onSectionChange }: SidebarProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, sectionId: string) => {
    // Handle Enter or Space key to activate section
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSectionChange(sectionId);
    }
  };

  return (
    <nav className="sticky top-6 card p-0 animate-slide-in" aria-label="Article sections">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-bold text-lg text-green-400">SECTIONS</h2>
      </div>
      
      <div className="py-2 stagger-children" role="tablist">
        {/* Highlights Section */}
        <div 
          role="tab"
          tabIndex={activeSection === 'highlights' ? 0 : -1}
          aria-selected={activeSection === 'highlights'}
          aria-controls="highlights-content"
          id="tab-highlights"
          className={`sidebar-section p-4 cursor-pointer mb-1 ${activeSection === 'highlights' ? 'active' : ''}`}
          onClick={() => onSectionChange('highlights')}
          onKeyDown={(e) => handleKeyDown(e, 'highlights')}
        >
          <div className="font-medium">Story Highlights</div>
          <div className="text-sm text-gray-400">Key points & summary</div>
        </div>
        
        {/* Article Sections */}
        {sections.map(section => (
          <div 
            key={section.id}
            role="tab"
            tabIndex={activeSection === section.id ? 0 : -1}
            aria-selected={activeSection === section.id}
            aria-controls={`${section.id}-content`}
            id={`tab-${section.id}`}
            className={`sidebar-section p-4 cursor-pointer mb-1 ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionChange(section.id)}
            onKeyDown={(e) => handleKeyDown(e, section.id)}
          >
            <div className="font-medium">{section.title}</div>
            {section.subtitle && (
              <div className="text-sm text-gray-400">{section.subtitle}</div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}