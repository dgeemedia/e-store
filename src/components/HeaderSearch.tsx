'use client'
import { useLang } from '@/lib/i18n'
export default function HeaderSearch() {
  const { t } = useLang()
  return <form action="/" method="get" className="hsearch"><input name="q" placeholder={t('nav.searchPh')} aria-label={t('nav.search')} /><button className="btn" type="submit">{t('nav.search')}</button></form>
}
