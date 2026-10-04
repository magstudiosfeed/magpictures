const base = import.meta.env.BASE_URL

const links = [
  { href: 'about.html', label: 'About', page: 'about' },
  { href: 'work.html', label: 'Work', page: 'work' },
  { href: 'expertise.html', label: 'Expertise', page: 'expertise' },
  { href: 'team.html', label: 'Team', page: 'team' },
  { href: 'contact.html', label: 'Contact', page: 'contact' },
]

function navLinks(active) {
  return links
    .map(
      ({ href, label, page }) =>
        `<a href="${base}${href}" class="${page === active ? 'is-active' : ''}">${label}</a>`
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
      <a class="brand" href="${base}" aria-label="MAG Pictures home">
        <img class="brand__logo" src="${base}images/logo-clear.png" alt="MAG Pictures" width="120" height="120" />
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
    footer.innerHTML = `
      <a class="site-footer__brand" href="${base}">
        <img src="${base}images/logo-clear.png" alt="MAG Pictures" width="160" height="160" />
      </a>
      <div class="site-footer__meta">
        <p class="site-footer__copy">© 2026 MAG Pictures</p>
        <a class="text-link" href="${base}contact.html" data-cursor="link">
          Contact us <span class="arrow" aria-hidden="true">→</span>
        </a>
      </div>
    `
  }
}
