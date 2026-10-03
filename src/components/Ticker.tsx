const DEFAULT = ['FACTORY-DIRECT, OPOR!', 'SHIKINI MONEY', 'BUY DIRECT FROM THE SOURCE', 'EVERY PRODUCT. EVERY SELLER.', 'BULK ORDERS WELCOME', 'THE MORE YOU BUY, THE CHEAPER YOU PAY', 'WHOLESALERS · RETAILERS · EVERYONE']
export default function Ticker({ items }: { items?: string[] }) {
  const list = items?.length ? items : DEFAULT
  const row = [...list, ...list, ...list]
  return (<div className="ticker" aria-label={list.join(', ')}><div className="ticker-track" aria-hidden>
    {[0, 1].map((k) => <div key={k} className="ticker-row">{row.map((t, i) => <span key={i}>{t}<i>★</i></span>)}</div>)}
  </div></div>)
}
