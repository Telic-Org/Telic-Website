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

const heroControlSteps = Array.from(document.querySelectorAll('.hero-runtime .control-step[data-hero-step]'));
const heroAppTargets = Array.from(document.querySelectorAll('.hero-runtime [data-hero-step]:not(.control-step)'));
const heroFlowLines = Array.from(document.querySelectorAll('.hero-runtime .flow-line'));
const heroStatus = document.querySelector('[data-hero-status]');
const heroStatusText = [
  'Finding the customer account',
  'Creating the order record',
  'Adding the product and quantity',
  'Submitting and verifying the result'
];

if (heroControlSteps.length) {
  let heroStepIndex = 0;
  const showHeroStep = (index) => {
    heroControlSteps.forEach((step, stepIndex) => {
      step.classList.toggle('complete', stepIndex < index);
      step.classList.toggle('current', stepIndex === index);
      const icon = step.querySelector('i');
      if (icon) icon.textContent = stepIndex < index ? '✓' : String(stepIndex + 1);
    });
    heroFlowLines.forEach((line, lineIndex) => {
      line.classList.toggle('done', lineIndex < index);
      line.classList.toggle('running', lineIndex === index);
    });
    heroAppTargets.forEach((target) => {
      target.classList.toggle('is-current', Number(target.dataset.heroStep) === index);
    });
    if (heroStatus) heroStatus.textContent = heroStatusText[index];
  };

  showHeroStep(heroStepIndex);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.setInterval(() => {
      heroStepIndex = (heroStepIndex + 1) % heroControlSteps.length;
      showHeroStep(heroStepIndex);
    }, 1900);
  }
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('.form-success')?.classList.add('show');
  });
}
