'use client';

import { Section } from '@/types';

interface SidebarProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function Sidebar({ sections, activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="sticky top-6 card p-0 animate-slide-in">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-bold text-lg text-green-400">SECTIONS</h2>
      </div>
      
      <div className="py-2 stagger-children">
        {/* Highlights Section */}
        <div 
          className={`sidebar-section p-4 cursor-pointer mb-1 ${activeSection === 'highlights' ? 'active' : ''}`}
          onClick={() => onSectionChange('highlights')}
        >
          <div className="font-medium">Story Highlights</div>
          <div className="text-sm text-gray-400">Key points & summary</div>
        </div>
        
        {/* Article Sections */}
        {sections.map(section => (
          <div 
            key={section.id}
            className={`sidebar-section p-4 cursor-pointer mb-1 ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionChange(section.id)}
          >
            <div className="font-medium">{section.title}</div>
            {section.subtitle && (
              <div className="text-sm text-gray-400">{section.subtitle}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}