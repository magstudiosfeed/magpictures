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
        <span class="brand__marks" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
        <span class="brand__wordmark">
          <strong>MAG</strong>
          <em>PICTURES</em>
        </span>
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
        <img src="${base}images/logo.png" alt="MAG Pictures" width="140" height="140" />
      </a>
      <p class="site-footer__copy">© 2026 MAG Pictures</p>
      <div class="socials">
        <a href="#" aria-label="Instagram" data-cursor="link">IG</a>
        <a href="#" aria-label="LinkedIn" data-cursor="link">LI</a>
        <a href="#" aria-label="Vimeo" data-cursor="link">VM</a>
      </div>
      <a class="text-link" href="${base}contact.html" data-cursor="link">
        Contact us <span class="arrow" aria-hidden="true">→</span>
      </a>
    `
  }
}
