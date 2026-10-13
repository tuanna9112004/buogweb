'use client';

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Student } from '@/types';

export default function StudentShowcase({ students }: { students: Student[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () => setEdges({ start: element.scrollLeft < 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { element.removeEventListener('scroll', update); observer.disconnect(); };
  }, [students]);
  if (!students.length) return null;
  const move = (direction: number) => {
    const element = rail.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement;
    element.scrollBy({ left: direction * (card.offsetWidth + 16), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <section className="student-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="students-heading">
    <div className="student-heading"><h2 id="students-heading">Học viên của BUOGS</h2><div className="student-controls">
      <button type="button" aria-label="Học viên trước" disabled={edges.start} onClick={() => move(-1)}><ChevronLeft size={18} /></button>
      <button type="button" aria-label="Học viên tiếp theo" disabled={edges.end} onClick={() => move(1)}><ChevronRight size={18} /></button>
    </div></div>
    <div className="student-rail" ref={rail} tabIndex={0} aria-label="Danh sách học viên, vuốt ngang để xem thêm">
      {students.map(student => <article className="student-card" key={student.id}>
        <div className="student-photo"><Image src={student.photo} alt={student.name} fill sizes="(max-width: 640px) 65vw, (max-width: 1024px) 30vw, 280px" className="object-cover" /></div>
        <h3>{student.name}</h3>
      </article>)}
    </div>
  </section>;
}
