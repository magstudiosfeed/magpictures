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
      <div class="header-end">
        <a
          class="social"
          href="https://www.linkedin.com/company/mag-pictures"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="MAG Pictures on LinkedIn"
          data-cursor="link"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12M7.12 20.45H3.56V9h3.56zM20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46z" />
          </svg>
        </a>
        <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span>
        </button>
      </div>
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
