/** Animated illustrations for the "Who we serve" cards. Pure SVG + CSS (about 3 KB each, no images to download).
 *  Shown when no photo is uploaded in Site Settings; an uploaded photo always wins. */
export default function AudArt({ kind }: { kind: 'wholesale' | 'retail' | 'buyer' }) {
  return (<svg className={`av av-${kind}`} viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
    <defs>
      <linearGradient id={`sky-${kind}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dff0ff" /><stop offset="1" stopColor="#f4fbe9" /></linearGradient>
    </defs>
    <rect width="300" height="200" fill={`url(#sky-${kind})`} />
    {kind === 'wholesale' && <g>
      <circle className="av-sun" cx="248" cy="40" r="16" fill="#ffd25e" />
      <rect x="0" y="150" width="300" height="50" fill="#cfd8c4" /><rect x="0" y="150" width="300" height="3" fill="#b7c3a9" />
      {/* warehouse */}
      <rect x="14" y="62" width="120" height="88" fill="#f7f5ef" stroke="#c8c3b2" strokeWidth="2" /><path d="M8 64 L74 34 L140 64 Z" fill="#0056b6" />
      <rect x="44" y="98" width="60" height="52" fill="#0056b6" /><g stroke="#fff" strokeWidth="2" opacity=".75"><path d="M44 112H104M44 126H104M44 140H104" /></g>
      {/* stacked cartons */}
      <g>{[[150, 132], [172, 132], [194, 132], [161, 114], [183, 114], [172, 96]].map(([x, y], i) => <g key={i} className="av-pop" style={{ animationDelay: `${i * 0.35}s` }}><rect x={x} y={y} width="20" height="18" rx="2" fill="#d9a35f" stroke="#a9763a" strokeWidth="1.5" /><path d={`M${x + 10} ${y}V${y + 18}`} stroke="#a9763a" strokeWidth="1.5" /></g>)}</g>
      {/* truck */}
      <g className="av-truck">
        <rect x="-10" y="112" width="70" height="38" rx="3" fill="#68be23" /><rect x="-4" y="120" width="36" height="6" fill="#fff" opacity=".7" /><rect x="-4" y="130" width="26" height="6" fill="#fff" opacity=".45" />
        <path d="M60 126 H80 L92 140 V150 H60 Z" fill="#0056b6" /><path d="M66 130 H78 L86 140 H66 Z" fill="#dff0ff" />
        {[6, 36, 76].map((cx) => <g key={cx}><circle cx={cx} cy="152" r="9" fill="#0f1f2e" /><g className="av-spin" style={{ transformOrigin: `${cx}px 152px` }}><circle cx={cx} cy="152" r="4" fill="#cfd8c4" /><path d={`M${cx - 4} 152H${cx + 4}`} stroke="#0f1f2e" strokeWidth="1.5" /></g></g>)}
      </g>
    </g>}
    {kind === 'retail' && <g>
      <rect x="0" y="158" width="300" height="42" fill="#cfd8c4" />
      {/* shop */}
      <rect x="50" y="60" width="200" height="98" fill="#f7f5ef" stroke="#c8c3b2" strokeWidth="2" />
      <g>{Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${50 + i * 25} 60 h25 l-3 26 h-19 z`} fill={i % 2 ? '#fff' : '#0056b6'} stroke="#0056b6" strokeWidth="1" />)}</g>
      <path d="M44 60 H256 L248 50 H52 Z" fill="#208c28" />
      <rect x="66" y="96" width="76" height="62" fill="#dff0ff" stroke="#c8c3b2" strokeWidth="2" />
      <g>{[[72, 118, '#0056b6'], [94, 118, '#68be23'], [116, 118, '#e5391f'], [72, 140, '#68be23'], [94, 140, '#e5391f'], [116, 140, '#0056b6']].map(([x, y, c]: any, i) => <rect key={i} className="av-bob" style={{ animationDelay: `${i * 0.25}s` }} x={x} y={y - 14} width="16" height="14" rx="2" fill={c} />)}</g>
      <rect x="168" y="96" width="62" height="62" fill="#0056b6" /><circle cx="176" cy="128" r="3" fill="#ffd25e" />
      <g className="av-glow"><circle cx="155" cy="110" r="7" fill="#ffd25e" /><path d="M155 103v-6" stroke="#c8c3b2" strokeWidth="2" /></g>
      {/* customer walking in */}
      <g className="av-walk"><circle cx="0" cy="132" r="7" fill="#e9b88a" /><path d="M-8 140 h16 v22 h-16z" fill="#208c28" rx="3" /><path d="M-5 162v10M5 162v10" stroke="#0f1f2e" strokeWidth="3" strokeLinecap="round" /><rect x="8" y="148" width="10" height="12" rx="2" fill="#e5391f" /></g>
    </g>}
    {kind === 'buyer' && <g>
      <circle className="av-sun" cx="40" cy="38" r="14" fill="#ffd25e" />
      <rect x="0" y="168" width="300" height="32" fill="#cfd8c4" />
      {/* phone */}
      <rect x="104" y="22" width="92" height="156" rx="14" fill="#0f1f2e" /><rect x="110" y="32" width="80" height="136" rx="8" fill="#fff" />
      <rect x="116" y="40" width="68" height="34" rx="6" fill="#dff0ff" /><circle cx="134" cy="57" r="9" fill="#0056b6" className="av-pulse" /><rect x="148" y="49" width="30" height="5" rx="2" fill="#0056b6" /><rect x="148" y="59" width="22" height="5" rx="2" fill="#68be23" />
      <rect x="116" y="80" width="68" height="22" rx="5" fill="#f7f5ef" /><rect x="122" y="87" width="34" height="5" rx="2" fill="#cfd8c4" />
      <rect className="av-btn" x="116" y="112" width="68" height="20" rx="10" fill="#68be23" /><rect x="136" y="120" width="28" height="4" rx="2" fill="#fff" />
      <g className="av-check"><circle cx="150" cy="150" r="10" fill="#208c28" /><path d="M144 150 l5 5 l9 -10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
      {/* falling items into bag */}
      <g className="av-drop"><rect x="214" y="30" width="16" height="16" rx="3" fill="#0056b6" /></g>
      <g className="av-drop d2"><rect x="238" y="30" width="14" height="14" rx="3" fill="#e5391f" /></g>
      <g className="av-bag"><path d="M208 118 h58 l6 54 h-70 z" fill="#68be23" /><path d="M222 118 v-10 a14 14 0 0 1 28 0 v10" stroke="#208c28" strokeWidth="4" fill="none" /><rect x="224" y="136" width="26" height="6" rx="3" fill="#fff" opacity=".8" /></g>
      <g className="av-bob" style={{ animationDelay: '.3s' }}><path d="M30 120 h40 l-6 30 h-28 z" fill="#0056b6" /><circle cx="42" cy="158" r="5" fill="#0f1f2e" /><circle cx="62" cy="158" r="5" fill="#0f1f2e" /><path d="M24 112 h8 l4 8" stroke="#0f1f2e" strokeWidth="3" fill="none" strokeLinecap="round" /></g>
    </g>}
  </svg>)
}
