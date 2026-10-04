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
}
