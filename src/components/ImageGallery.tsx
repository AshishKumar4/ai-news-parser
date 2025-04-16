'use client';

import { useState, useMemo, useEffect } from 'react';
import { ArticleImage } from '@/types';
import { FiMaximize, FiX, FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';

interface ImageGalleryProps {
  images: ArticleImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ArticleImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});
  const [validImages, setValidImages] = useState<ArticleImage[]>([]);

  // Filter to show only the most relevant images (avoid duplicates, small images, etc.)
  const filteredImages = useMemo(() => {
    // Deduplicate images by URL
    const uniqueUrls = new Set<string>();
    return images
      .filter(img => {
        // Skip if we already have this URL
        if (uniqueUrls.has(img.url)) return false;
        
        // Skip images with common irrelevant names or invalid URLs
        if (!img.url || 
            img.url.includes('avatar') || 
            img.url.includes('logo') || 
            img.url.includes('icon') ||
            img.url.includes('banner') ||
            img.url.includes('ad-') ||
            img.url.includes('pixel') ||
            !img.url.match(/^https?:\/\/.+/i)) {
          return false;
        }
        
        uniqueUrls.add(img.url);
        return true;
      })
      .slice(0, 6); // Limit to 6 images max
  }, [images]);

  // Pre-check images using Image API
  useEffect(() => {
    const checkedImages: ArticleImage[] = [];
    let pending = filteredImages.length;
    
    if (filteredImages.length === 0) {
      setValidImages([]);
      return;
    }
    
    filteredImages.forEach((img) => {
      const image = new Image();
      image.onload = () => {
        // Only add images that have loaded successfully and have a minimum size
        if (image.naturalWidth > 50 && image.naturalHeight > 50) {
          checkedImages.push(img);
        }
        pending--;
        if (pending === 0) {
          setValidImages(checkedImages);
        }
      };
      image.onerror = () => {
        setLoadErrors(prev => ({ ...prev, [img.url]: true }));
        pending--;
        if (pending === 0) {
          setValidImages(checkedImages);
        }
      };
      // Set timeout to avoid hanging on slow-loading images
      const timeout = setTimeout(() => {
        if (image.complete === false) {
          image.src = '';
          setLoadErrors(prev => ({ ...prev, [img.url]: true }));
          pending--;
          if (pending === 0) {
            setValidImages(checkedImages);
          }
        }
      }, 5000);
      
      image.src = img.url;
      
      return () => clearTimeout(timeout);
    });
  }, [filteredImages]);

  // If no valid images after filtering and checking, don't render anything
  if (validImages.length === 0) {
    return null;
  }

  // Improved error handler with fallback
  const handleImageError = (url: string) => {
    setLoadErrors(prev => ({ ...prev, [url]: true }));
  };

  const handleNext = () => {
    setSelectedIndex((prevIndex) => (prevIndex + 1) % validImages.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prevIndex) => 
      prevIndex === 0 ? validImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="mt-6 animate-fade-in">
      <h3 className="text-lg font-bold mb-3 text-green-400">FEATURED IMAGES</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {validImages.map((image, index) => (
          <div 
            key={index} 
            className="aspect-square relative group cursor-pointer rounded-md overflow-hidden border border-gray-700 hover:border-green-500 transition-all bg-gray-800/50"
            onClick={() => {
              setSelectedImage(image);
              setSelectedIndex(index);
            }}
          >
            {loadErrors[image.url] ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <FiImage className="text-gray-500" size={24} />
              </div>
            ) : (
              <div className="w-full h-full relative">
                <img 
                  src={image.url} 
                  alt={image.alt || 'Article image'} 
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={() => handleImageError(image.url)}
                  loading="lazy"
                />
                {image.alt && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 to-transparent p-2 text-xs text-white truncate">
                    {image.alt}
                  </div>
                )}
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <FiMaximize 
                className="text-white opacity-0 group-hover:opacity-100 transition-all" 
                size={24} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-4xl max-h-[80vh]">
            {/* Navigation arrows */}
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
                setSelectedImage(validImages[selectedIndex]);
              }}
            >
              <FiChevronLeft size={24} className="text-white" />
            </button>
            
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
                setSelectedImage(validImages[selectedIndex]);
              }}
            >
              <FiChevronRight size={24} className="text-white" />
            </button>
            
            {/* Image and caption */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              {loadErrors[validImages[selectedIndex].url] ? (
                <div className="w-full h-[50vh] flex flex-col items-center justify-center bg-gray-800 text-gray-400">
                  <FiImage size={48} />
                  <p className="mt-4">Image could not be loaded</p>
                </div>
              ) : (
                <img 
                  src={validImages[selectedIndex].url} 
                  alt={validImages[selectedIndex].alt || 'Article image'} 
                  className="max-w-full max-h-[70vh] mx-auto object-contain"
                  onError={() => handleImageError(validImages[selectedIndex].url)}
                />
              )}
              
              {/* Caption */}
              <div className="p-4 text-center">
                <p className="text-gray-300">{validImages[selectedIndex].alt || 'Image from article'}</p>
                <p className="text-sm text-gray-400 mt-1">Image {selectedIndex + 1} of {validImages.length}</p>
              </div>
            </div>
          </div>
          
          <button 
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <FiX size={24} />
          </button>
        </div>
      )}
    </div>
  );
}