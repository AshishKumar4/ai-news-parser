'use client';

import { ArticleMetadata } from '@/types';
import { FiHelpCircle } from 'react-icons/fi';

interface ArticleHeaderProps {
  metadata: ArticleMetadata;
}

export default function ArticleHeader({ metadata }: ArticleHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{metadata.title}</h1>
      <div className="text-sm text-gray-400 mb-4 flex justify-between items-center">
        <div>
          Source: {metadata.source} | By: {metadata.author} | {metadata.date}
        </div>
        <button className="p-1 rounded-full hover:bg-gray-700" aria-label="Help">
          <FiHelpCircle size={20} />
        </button>
      </div>
    </div>
  );
}