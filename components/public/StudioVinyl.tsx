'use client';

import { useAudio } from './AudioPlayerContext';
import { useEffect, useRef, useState } from 'react';

export default function StudioVinyl() {
  const { isPlaying } = useAudio();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (ref.current) observer.observe(ref.current);
    const syncVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', syncVisibility); };
  }, []);
  return <div ref={ref} className="studio-vinyl-frame" aria-hidden="true"><div className={`studio-vinyl ${isPlaying && visible && pageVisible ? 'is-playing' : ''}`}><span className="vinyl-label">BUOGS<span>SELECTED SOUNDS</span></span></div><span className="vinyl-caption">{isPlaying ? 'NOW PLAYING' : 'SOUND IN MOTION'}</span></div>;
}
