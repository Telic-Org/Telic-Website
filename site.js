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

const stage = document.querySelector('.execution-stage');
const events = Array.from(document.querySelectorAll('.runtime-event'));
const replay = document.querySelector('.replay-button');
const sequenceButtons = Array.from(document.querySelectorAll('.sequence-step'));
const sequenceTitle = document.querySelector('.sequence-title');
let executionTimer;

const sequence = [
  { state: 'reuse', event: 0, label: 'Reusing a verified path', delay: 2100 },
  { state: 'model', event: 1, label: 'Using AI for one uncertain decision', delay: 2600 },
  { state: 'exception', event: 2, label: 'Unexpected application state detected', delay: 2500 },
  { state: 'recover', event: 3, label: 'Resolving the exception and resuming', delay: 2500 },
  { state: 'verified', event: 4, label: 'Outcome verified — workflow complete', delay: 3000 }
];

function runExecution(index = 0, autoplay = true) {
  if (!stage || !events.length) return;
  clearTimeout(executionTimer);
  if (index === 0) events.forEach((event) => event.classList.remove('show', 'current'));
  const frame = sequence[index];
  stage.dataset.state = frame.state;
  if (sequenceTitle) sequenceTitle.textContent = frame.label;
  sequenceButtons.forEach((button, buttonIndex) => {
    button.classList.toggle('active', buttonIndex === index);
    button.classList.toggle('passed', buttonIndex < index);
  });
  events.forEach((event) => event.classList.remove('current'));
  events.slice(0, frame.event + 1).forEach((event) => event.classList.add('show'));
  events[frame.event].classList.add('current');
  if (autoplay) {
    executionTimer = setTimeout(() => runExecution((index + 1) % sequence.length, true), frame.delay);
  }
}

if (stage) {
  runExecution();
  replay?.addEventListener('click', () => runExecution(0, true));
  sequenceButtons.forEach((button) => {
    button.addEventListener('click', () => runExecution(Number(button.dataset.sequence), false));
  });
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('.form-success')?.classList.add('show');
  });
}
