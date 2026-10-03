'use client'
import { useState } from 'react'
export default function Gallery({ imgs, alt }: { imgs: { big: string; thumb: string }[]; alt: string }) {
  const [i, setI] = useState(0)
  return (<div><img src={imgs[i].big} alt={alt} />
    {imgs.length > 1 && <div className="thumbs">{imgs.map((m, k) => <img key={k} src={m.thumb} alt="" className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>}</div>)
}
