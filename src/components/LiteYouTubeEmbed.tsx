"use client";

import { useState } from "react";
import { FaYoutube } from "react-icons/fa";

interface LiteYouTubeEmbedProps {
  videoId: string;
  title?: string;
}

export default function LiteYouTubeEmbed({ videoId, title = "YouTube Video" }: LiteYouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div 
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden cursor-pointer group shadow-md flex items-center justify-center"
      onClick={() => setIsLoaded(true)}
    >
      {!isLoaded ? (
        <>
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
          />
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className="w-16 h-12 bg-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
              <FaYoutube className="text-white text-3xl" />
            </div>
          </div>
        </>
      ) : (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
}
