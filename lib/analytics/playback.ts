export interface ListenSample { id: string; seconds: number; sent: boolean; time: number; wall: number }
// Count actual playback elapsed time, never a jump caused by seeking or buffer preparation.
export function accumulateListen(sample: ListenSample, time: number, now: number, rate: number, playing: boolean) {
  const delta = time - sample.time;
  const elapsed = sample.wall ? (now - sample.wall) / 1000 : 0;
  if (playing && rate > 0 && delta > 0 && delta <= elapsed * rate + 0.25) sample.seconds += Math.min(delta / rate, elapsed);
  sample.time = time; sample.wall = now;
  return sample.seconds >= 10 && !sample.sent;
}
