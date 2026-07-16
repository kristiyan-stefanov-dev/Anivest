'use client';

import { useRef } from 'react';
import type { ProjectWithStudio } from '@/models/Schema';
import { ProjectCard } from './ProjectCard';

export const ProjectCarousel = (props: { title: string; projects: ProjectWithStudio[] }) => {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: number) => {
    scroller.current?.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  if (props.projects.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{props.title}</h2>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => {
              scrollBy(-1);
            }}
            className="rounded-full border border-gray-300 px-3 py-1 text-gray-600 hover:bg-gray-100"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => {
              scrollBy(1);
            }}
            className="rounded-full border border-gray-300 px-3 py-1 text-gray-600 hover:bg-gray-100"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex snap-x snap-mandatory [scrollbar-width:thin] gap-4 overflow-x-auto pb-4"
      >
        {props.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
};
