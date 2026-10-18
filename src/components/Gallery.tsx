'use client'
import { useRef, useState } from 'react'
/** Product photos. Phones: swipe with a finger (native scroll-snap). Desktop: arrow buttons, click-and-drag with the mouse,
 *  keyboard left/right arrows, dots and thumbnails. The arrow buttons only appear on devices with a mouse. */
export default function Gallery({ imgs, alt }: { imgs: { big: string; thumb: string }[]; alt: string }) {
  const [i, setI] = useState(0), track = useRef<HTMLDivElement>(null), raf = useRef(0), drag = useRef<{ x: number; s: number } | null>(null)
  const n = imgs.length
  const onScroll = () => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => { const el = track.current; if (el) setI(Math.round(el.scrollLeft / el.clientWidth)) })
  }
  const go = (k: number) => { const el = track.current; if (el) el.scrollTo({ left: Math.max(0, Math.min(n - 1, k)) * el.clientWidth, behavior: 'smooth' }) }
  const down = (e: React.PointerEvent) => { const el = track.current; if (e.pointerType !== 'mouse' || !el) return; drag.current = { x: e.clientX, s: el.scrollLeft }; el.classList.add('drag'); el.setPointerCapture(e.pointerId) }
  const move = (e: React.PointerEvent) => { const el = track.current; if (drag.current && el) el.scrollLeft = drag.current.s - (e.clientX - drag.current.x) }
  const up = () => { const el = track.current; if (!drag.current || !el) return; drag.current = null; el.classList.remove('drag'); go(Math.round(el.scrollLeft / el.clientWidth)) }
  const key = (e: React.KeyboardEvent) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1) } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1) } }
  return (<div className="gal">
    <div className="gal-wrap">
      <div className="gal-track" ref={track} onScroll={onScroll} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key} tabIndex={0} aria-roledescription="carousel" aria-label={alt}>
        {imgs.map((m, k) => <img key={k} src={m.big} alt={k === 0 ? alt : `${alt} - photo ${k + 1}`} loading={k === 0 ? 'eager' : 'lazy'} draggable={false} />)}
      </div>
      {n > 1 && <>
        <button type="button" className="gal-nav prev" aria-label="Previous photo" disabled={i <= 0} onClick={() => go(i - 1)}>‹</button>
        <button type="button" className="gal-nav next" aria-label="Next photo" disabled={i >= n - 1} onClick={() => go(i + 1)}>›</button>
        <span className="gal-count">{i + 1} / {n}</span>
      </>}
    </div>
    {n > 1 && <>
      <div className="gal-dots" aria-hidden>{imgs.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
      <div className="thumbs">{imgs.map((m, k) => <img key={k} src={m.thumb} alt="" className={k === i ? 'on' : ''} onClick={() => go(k)} />)}</div>
    </>}
  </div>)
}
