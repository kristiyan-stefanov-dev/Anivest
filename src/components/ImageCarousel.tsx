'use client';

import { useState } from 'react';

type ImageItem = {
  id: number;
  imageUrl: string;
  altText: string;
};

export const ImageCarousel = (props: { images: ImageItem[]; coverImageUrl?: string }) => {
  const allImages: ImageItem[] = [];

  if (props.coverImageUrl) {
    allImages.push({ id: 0, imageUrl: props.coverImageUrl, altText: 'Cover' });
  }

  for (const img of props.images) {
    if (img.imageUrl !== props.coverImageUrl) {
      allImages.push(img);
    }
  }

  const [activeIndex, setActiveIndex] = useState(0);

  if (allImages.length === 0) {
    return <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100" />;
  }

  const safeIndex = Math.min(activeIndex, allImages.length - 1);
  const active = allImages[safeIndex];

  if (!active) {
    return <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100" />;
  }

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={active.imageUrl} alt={active.altText} className="h-full w-full object-cover" />

        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute top-1/2 left-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Next image"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {allImages.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => {
                    setActiveIndex(index);
                  }}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === activeIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => {
                setActiveIndex(index);
              }}
              className={`h-16 w-28 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                index === activeIndex
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.imageUrl}
                alt={image.altText}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
