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

const howVisual = document.querySelector('.design-execution-visual[data-how-state]');

if (howVisual) {
  const howNodes = Array.from(howVisual.querySelectorAll('[data-how-node]'));
  const howLinks = Array.from(howVisual.querySelectorAll('.node-link'));
  const howTargets = Array.from(howVisual.querySelectorAll('[data-how-target]'));
  const howBridge = howVisual.querySelector('[data-how-bridge]');
  const howBridgeNote = howVisual.querySelector('[data-how-bridge-note]');
  const exceptionTag = howNodes[2]?.querySelector('em');
  const howFrames = [
    { state: 'read', node: 0, target: -1, bridge: 'STEP 1', note: 'READING INPUT', delay: 1800 },
    { state: 'execute', node: 1, target: 1, bridge: 'STEP 2', note: 'EXECUTING IN APP', delay: 2100 },
    { state: 'exception', node: 2, target: 2, bridge: 'STEP 3', note: 'EXCEPTION DETECTED', delay: 2300 },
    { state: 'model', node: 2, target: 2, bridge: 'STEP 3', note: 'AI MODEL RESOLVING', delay: 2600 },
    { state: 'continue', node: 2, target: 2, bridge: 'STEP 3', note: 'RESOLVED — CONTINUING', delay: 1900 },
    { state: 'verified', node: 3, target: 3, bridge: 'STEP 4', note: 'VERIFYING RESULT', delay: 2600 }
  ];
  let howFrameIndex = 0;
  let howTimer;

  const runHowFrame = (index) => {
    const frame = howFrames[index];
    howVisual.dataset.howState = frame.state;
    howNodes.forEach((node, nodeIndex) => {
      node.classList.toggle('complete', nodeIndex < frame.node || (frame.state === 'verified' && nodeIndex < 3));
      node.classList.toggle('current', nodeIndex === frame.node);
      const icon = node.querySelector('i');
      if (icon) icon.textContent = nodeIndex < frame.node ? '✓' : String(nodeIndex + 1);
    });
    howLinks.forEach((link, linkIndex) => link.classList.toggle('done', linkIndex < frame.node));
    howTargets.forEach((target) => target.classList.toggle('how-current', Number(target.dataset.howTarget) === frame.target));
    if (exceptionTag) {
      exceptionTag.textContent = frame.state === 'model' ? 'AI MODEL' : frame.state === 'continue' ? 'RESOLVED' : 'EXCEPTION';
    }
    if (howBridge) howBridge.textContent = frame.bridge;
    if (howBridgeNote) howBridgeNote.textContent = frame.note;
    clearTimeout(howTimer);
    howTimer = window.setTimeout(() => {
      howFrameIndex = (index + 1) % howFrames.length;
      runHowFrame(howFrameIndex);
    }, frame.delay);
  };

  runHowFrame(howFrameIndex);
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('.form-success')?.classList.add('show');
  });
}
