/**
 * usePageMeta — set <title>, meta description, og:*, twitter:* di <head>
 * Karena ini SPA (tidak SSR), meta diset via DOM.
 * Untuk share link yang benar-benar kaya (WhatsApp/Twitter unfurl),
 * perlu SSR atau prerender — lihat README.
 */

const SITE_NAME  = 'Glory8 Products'
const SITE_URL   = 'https://glory8-products.vercel.app'                
const DEFAULT_IMG = `${SITE_URL}/og-default.jpg`
const TWITTER    = '@glory8id'                        

function setMeta(property, content, attr = 'name') {
  if (!content) return
  let el = document.querySelector(
    attr === 'property'
      ? `meta[property="${property}"]`
      : `meta[name="${property}"]`
  )
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta({ title, description, image, url, type = 'website' } = {}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME
  const metaDesc  = description || 'Material interior premium: WPC Wall Panel, SPC Flooring, Vinyl, PVC Panel untuk hunian dan proyek komersial.'
  const metaImage = image || DEFAULT_IMG
  const metaUrl   = url   || SITE_URL

  document.title = fullTitle

  setMeta('description',    metaDesc)
  setMeta('robots',         'index, follow')

  setMeta('og:title',       fullTitle,  'property')
  setMeta('og:description', metaDesc,   'property')
  setMeta('og:image',       metaImage,  'property')
  setMeta('og:url',         metaUrl,    'property')
  setMeta('og:type',        type,       'property')
  setMeta('og:site_name',   SITE_NAME,  'property')
  setMeta('og:locale',      'id_ID',    'property')

  setMeta('twitter:card',        'summary_large_image')
  setMeta('twitter:site',        TWITTER)
  setMeta('twitter:title',       fullTitle)
  setMeta('twitter:description', metaDesc)
  setMeta('twitter:image',       metaImage)
}
