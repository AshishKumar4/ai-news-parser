'use client';

import { useState } from 'react';
import { Section } from '@/types';
import { FiMenu, FiLayers } from 'react-icons/fi';

interface SidebarProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function Sidebar({ sections, activeSection, onSectionChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="lg:hidden dark-btn p-2 rounded-md mb-2 w-full flex items-center justify-between"
      >
        <span className="flex items-center">
          <FiLayers className="mr-2" /> Sections
        </span>
        <FiMenu size={20} />
      </button>
      
      <div className={`card overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0 lg:max-h-none'} lg:block`}>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 tracking-wide">EXPLORE SECTIONS</h3>
          <nav className="space-y-2">
            <div 
              className={`sidebar-section py-3 px-4 cursor-pointer ${activeSection === 'highlights' ? 'active' : ''}`}
              onClick={() => {
                onSectionChange('highlights');
                setIsOpen(false);
              }}
            >
              Story Highlights
            </div>
            
            {sections.map((section) => (
              <div
                key={section.id}
                className={`sidebar-section py-3 px-4 cursor-pointer ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => {
                  onSectionChange(section.id);
                  setIsOpen(false);
                }}
              >
                {section.title}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}