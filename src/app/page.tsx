import UrlInput from '@/components/UrlInput';
import { FiSend } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800/50 py-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold">Smart Story Analyzer</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">New View News Analyzer</h1>
          <p className="mb-8 max-w-2xl mx-auto text-gray-300">
            Enter the article URL below to either scan details or dive deep into its structure and content.
          </p>
          
          <UrlInput />
          
          <div className="mt-8 flex flex-col items-center justify-center">
            <div className="bg-gray-800/50 rounded-lg p-5 max-w-md">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <FiSend className="mr-2 text-green-500" /> How It Works
              </h3>
              <p className="text-sm text-gray-300 text-left">
                Simply paste any news article URL above, and our AI will analyze and structure the content into a navigable format with highlights, summaries, and thematic sections - all designed for better comprehension and faster reading.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800/30 py-3 border-t border-gray-700 text-center text-xs text-gray-500">
        Smart Story Analyzer © 2025
      </footer>
    </div>
  );
}
