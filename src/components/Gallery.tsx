'use client'
import { useRef, useState } from 'react'
/** Swipeable gallery: native scroll-snap, so a finger swipe on a phone moves to the next photo (no arrows needed).
 *  Dots show the position; thumbnails (desktop) jump to a photo. */
export default function Gallery({ imgs, alt }: { imgs: { big: string; thumb: string }[]; alt: string }) {
  const [i, setI] = useState(0), track = useRef<HTMLDivElement>(null), raf = useRef(0)
  const onScroll = () => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => { const el = track.current; if (el) setI(Math.round(el.scrollLeft / el.clientWidth)) })
  }
  const go = (k: number) => { const el = track.current; if (el) el.scrollTo({ left: k * el.clientWidth, behavior: 'smooth' }) }
  return (<div className="gal">
    <div className="gal-track" ref={track} onScroll={onScroll}>
      {imgs.map((m, k) => <img key={k} src={m.big} alt={k === 0 ? alt : `${alt} - photo ${k + 1}`} loading={k === 0 ? 'eager' : 'lazy'} draggable={false} />)}
    </div>
    {imgs.length > 1 && <>
      <div className="gal-dots" aria-hidden>{imgs.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
      <div className="thumbs">{imgs.map((m, k) => <img key={k} src={m.thumb} alt="" className={k === i ? 'on' : ''} onClick={() => go(k)} />)}</div>
    </>}
  </div>)
}
