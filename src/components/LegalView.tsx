'use client'
import { LEGAL, LEGAL_I18N } from '@/lib/legal'
import { useLang } from '@/lib/i18n'
export default function LegalView({ slug }: { slug: string }) {
  const { lang, t } = useLang()
  const d = (lang === 'en' ? LEGAL[slug] : LEGAL_I18N[lang]?.[slug]) || LEGAL[slug]
  return (<div className="wrap prose" style={{ maxWidth: 760, padding: '30px 20px' }}><h1>{d.title}</h1><small>Elorge Technologies Limited · RC 9521453</small>
    {lang !== 'en' && <p style={{ color: 'var(--mute)' }}><small>{t('f.legalEn')}</small></p>}
    {d.sections.map(([h, x]) => <section key={h}><h3>{h}</h3><p>{x}</p></section>)}</div>)
}
