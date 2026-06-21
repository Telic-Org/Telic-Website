const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');
const solutions = document.querySelector('.solutions');
const solutionsTrigger = document.querySelector('.solutions-trigger');

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', String(open));
  });
}

if (solutions && solutionsTrigger) {
  solutionsTrigger.addEventListener('click', () => {
    const open = solutions.classList.toggle('open');
    solutionsTrigger.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (event) => {
    if (!solutions.contains(event.target)) {
      solutions.classList.remove('open');
      solutionsTrigger.setAttribute('aria-expanded', 'false');
    }
  });
}

document.querySelectorAll('.nav-link, .solution-link').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks?.classList.remove('open');
    mobileToggle?.setAttribute('aria-expanded', 'false');
  });
});

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('.form-success')?.classList.add('show');
  });
}
