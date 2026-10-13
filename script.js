'use strict';

// Preencher apenas com destinos reais confirmados pelo proprietário.
const portfolioLinks = {
  projects: 'projetos.html',
};

const dialog = document.querySelector('#pending-dialog');
document.querySelectorAll('[data-pending]').forEach((button) => {
  const key = button.dataset.pending;
  const url = portfolioLinks[key];
  if (url) {
    const link = document.createElement('a');
    link.href = url;
    link.innerHTML = button.innerHTML;
    if (button.hasAttribute('aria-label')) link.setAttribute('aria-label', button.getAttribute('aria-label'));
    button.replaceWith(link);
    return;
  }
  button.addEventListener('click', () => {
    document.querySelector('#pending-description').textContent = key === 'projects'
      ? 'Os projetos ainda não foram adicionados a este portfólio.'
      : 'O endereço desta rede ainda não foi informado pelo proprietário do portfólio.';
    dialog.showModal();
  });
});
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealItems = document.querySelectorAll(
  '.hero-photo, .hero h1, .tagline, .hero .contact-button, ' +
  '.welcome h2, .welcome p, .welcome-image, ' +
  '.concept h2, .concept p, .concept-image, ' +
  '.footer .logo, .social-links a, .social-mark > p, [data-reveal]'
);
let observer;
function configureMotion() {
  observer?.disconnect();
  revealItems.forEach((item) => item.classList.remove('is-pending'));
  document.querySelector('.tiles')?.classList.remove('is-animated');
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  document.querySelectorAll('.tiles span').forEach((tile, index) => tile.style.setProperty('--index', index));
  document.querySelector('.tiles')?.classList.add('is-animated');
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Só reinicia quando o elemento sai da tela por completo, em qualquer direção.
      if (!entry.isIntersecting) {
        entry.target.style.setProperty('--reveal-offset', entry.boundingClientRect.top < 0 ? '-24px' : '24px');
      }
      entry.target.classList.toggle('is-pending', !entry.isIntersecting);
    });
  }, { threshold: 0 });
  revealItems.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.setProperty('--reveal-delay', `${(index % 3) * 90}ms`);
    item.classList.add('is-pending');
    observer.observe(item);
  });
}
configureMotion();
motionPreference.addEventListener('change', configureMotion);
