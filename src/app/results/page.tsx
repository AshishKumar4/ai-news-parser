'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParsedArticle, Section } from '@/types';
import Sidebar from '@/components/Sidebar';
import ArticleHeader from '@/components/ArticleHeader';
import StoryHighlights from '@/components/StoryHighlights';
import SectionContent from '@/components/SectionContent';
import RightSidebar from '@/components/RightSidebar';
import UrlInput from '@/components/UrlInput';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

export default function ResultsPage() {
  const router = useRouter();
  const [articleData, setArticleData] = useState<ParsedArticle | null>(null);
  const [activeSection, setActiveSection] = useState('highlights');
  const [view, setView] = useState<'summary' | 'detailed'>('summary');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve article data from sessionStorage
    const storedData = sessionStorage.getItem('articleData');
    
    if (storedData) {
      try {
        setArticleData(JSON.parse(storedData));
      } catch (error) {
        console.error('Error parsing article data:', error);
      }
    } else {
      // If no data, redirect back to homepage
      router.push('/');
    }
    
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!articleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">No article data found</h2>
          <button
            onClick={() => router.push('/')}
            className="primary-btn px-4 py-2 rounded-md flex items-center mx-auto"
          >
            <FiArrowLeft className="mr-2" /> Go back home
          </button>
        </div>
      </div>
    );
  }

  const { metadata, summary, highlights, sections } = articleData;
  
  // Get current section data
  const activeContent = activeSection === 'highlights' 
    ? <StoryHighlights highlights={highlights} summary={summary} view={view} /> 
    : <SectionContent 
        section={sections.find(s => s.id === activeSection) as Section} 
        summary={summary}
        view={view} 
      />;

  // Function to analyze article again
  const runAgain = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="dark-btn px-3 py-2 rounded-md flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Back to Home
          </button>
        </div>
        
        {/* URL Input for quick search */}
        <div className="mb-6">
          <UrlInput />
        </div>
        
        <div className="card p-6 mb-6">
          <ArticleHeader metadata={metadata} />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0 order-2 lg:order-1">
            <Sidebar 
              sections={sections} 
              activeSection={activeSection} 
              onSectionChange={setActiveSection} 
            />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 order-1 lg:order-2">
            <div className="card p-6">
              {/* Always use activeContent which properly handles the section switching */}
              {activeContent}
            </div>
            
            {/* Run Again Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={runAgain}
                className="primary-btn py-2 px-4 rounded-md flex items-center"
              >
                <FiRefreshCw className="mr-2" /> Run Again
              </button>
            </div>
          </div>
          
          {/* Right Sidebar - Metadata & Images */}
          <div className="w-full lg:w-72 flex-shrink-0 order-3">
            <RightSidebar 
              metadata={metadata} 
              view={view} 
              onViewChange={setView} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}