const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`

function path(slug = '') {
  return slug ? `${base}${slug}/` : base
}

const links = [
  { slug: 'about', label: 'About Us' },
  { slug: 'work', label: 'Work' },
  { slug: 'expertise', label: 'Expertise' },
  { slug: 'team', label: 'Team' },
  { slug: 'contact', label: 'Contact' },
]

function navLinks(active) {
  return links
    .map(
      ({ slug, label }) =>
        `<a href="${path(slug)}" class="${slug === active ? 'is-active' : ''}">${label}</a>`
    )
    .join('')
}

export function mountShell() {
  const page = document.body.dataset.page || 'home'
  const header = document.getElementById('site-header')
  const mobile = document.getElementById('mobile-nav')
  const footer = document.getElementById('site-footer')

  if (header) {
    header.innerHTML = `
      <a class="brand" href="${path()}" aria-label="MAG Pictures home">
        <img class="brand__logo" src="${base}images/logo-mag.png" alt="MAG Pictures" width="160" height="72" />
      </a>
      <nav class="nav" aria-label="Primary">${navLinks(page)}</nav>
      <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span>
      </button>
    `
  }

  if (mobile) {
    mobile.innerHTML = navLinks(page)
  }

  if (footer) {
    const contactCta =
      page === 'contact'
        ? ''
        : `<a class="text-link" href="${path('contact')}" data-cursor="link">
            Contact us <span class="arrow" aria-hidden="true">→</span>
          </a>`

    footer.innerHTML = `
      <a class="site-footer__brand" href="${path()}" aria-label="MAG Pictures home">
        <img src="${base}images/mark-3.svg" alt="" width="72" height="44" />
      </a>
      <div class="site-footer__meta">
        <p class="site-footer__copy">© 2026 MAG Pictures</p>
        ${contactCta}
      </div>
    `
  }

  if (!document.getElementById('rgb-split')) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
    svg.innerHTML = `
      <filter id="rgb-split" color-interpolation-filters="sRGB" x="-2%" y="-2%" width="104%" height="104%">
        <feOffset in="SourceGraphic" dx="-1.2" dy="0" result="offR"/>
        <feColorMatrix in="offR" type="matrix" values="
          1 0 0 0 0
          0 0 0 0 0
          0 0 0 0 0
          0 0 0 1 0" result="red"/>
        <feColorMatrix in="SourceGraphic" type="matrix" values="
          0 0 0 0 0
          0 1 0 0 0
          0 0 0 0 0
          0 0 0 1 0" result="green"/>
        <feOffset in="SourceGraphic" dx="1.2" dy="0" result="offB"/>
        <feColorMatrix in="offB" type="matrix" values="
          0 0 0 0 0
          0 0 0 0 0
          0 0 1 0 0
          0 0 0 1 0" result="blue"/>
        <feBlend in="red" in2="green" mode="screen" result="rg"/>
        <feBlend in="rg" in2="blue" mode="screen"/>
      </filter>
    `
    document.body.prepend(svg)
  }

  document.querySelector('.chroma')?.remove()
  let lens = document.querySelector('.lens')
  if (!lens) {
    lens = document.createElement('div')
    lens.className = 'lens'
    lens.setAttribute('aria-hidden', 'true')
    document.body.appendChild(lens)
  }
  lens.innerHTML = '<div class="lens__vignette"></div>'

  document.querySelectorAll('main, .site-header, .site-footer').forEach((el) => {
    el.classList.add('rgb-split')
  })
}
