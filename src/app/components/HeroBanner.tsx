// src/app/components/HeroBanner.tsx
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface HeroBannerProps {
  imageUrl: string;
  altText: string;
  title?: string; // Hacemos el título opcional
  subtitle?: string; // Hacemos el subtítulo opcional
  buttonText?: string; // Hacemos el texto del botón opcional
  buttonLink?: string; // Hacemos el enlace del botón opcional
  className?: string;
}

export default function HeroBanner({
  imageUrl,
  altText,
  title,
  subtitle,
  buttonText,
  buttonLink,
  className,
}: HeroBannerProps) {
  return (
    <div className={`relative w-full ${className || ''} flex items-center justify-center overflow-hidden`}>
      {/* Background Image */}
      <Image
        src={imageUrl}
        alt={altText}
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        quality={100}
        className="z-0"
      />

      {/* Overlay layer for text and button - only render if there's content to show */}
      {(title || subtitle || (buttonText && buttonLink)) && (
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10 flex flex-col items-center justify-center text-center p-4">
          {/* Title - only render if title exists */}
          {title && (
            <h1 className="text-white mb-4 drop-shadow-lg" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>
              {title}
            </h1>
          )}

          {/* Subtitle - only render if subtitle exists */}
          {subtitle && (
            <p className="text-white mb-8 max-w-2xl drop-shadow-md" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
              {subtitle}
            </p>
          )}

          {/* Button - only render if both buttonText and buttonLink exist */}
          {buttonText && buttonLink && (
            <Link href={buttonLink} className="inline-flex items-center px-8 py-4 border border-transparent text-xl font-medium rounded-full shadow-lg text-white bg-[#9b0018] hover:bg-[#800010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018] transition-colors duration-200 transform hover:scale-105">
              {buttonText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
