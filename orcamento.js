'use strict';

const budgetForm = document.querySelector('#budget-form');
const formStatus = document.querySelector('#form-status');
const submitButton = budgetForm.querySelector('[type="submit"]');
let isSending = false;
let requestId = null;

// Energia azul: mao, contorno externo do painel e cada campo em sequencia.
const energyMain = document.querySelector('#principal');
const budgetPanel = document.querySelector('.budget-panel');
const energyPath = document.querySelector('.panel-energy path');
budgetForm.querySelectorAll('.form-field').forEach((field, index) => {
  field.style.setProperty('--field-delay', `${4.4 + index * .75}s`);
});
const energyMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const animatedHand = document.querySelector('robot-hand');
let panelIsVisible = false;
let handIsVisible = false;

function updateEnergyPath() {
  const main = energyMain.getBoundingClientRect();
  const panel = budgetPanel.getBoundingClientRect();
  const gap = 7;
  const left = panel.left - main.left - gap;
  const top = panel.top - main.top - gap;
  const right = panel.right - main.left + gap;
  const bottom = panel.bottom - main.top + gap;
  const radius = parseFloat(getComputedStyle(budgetPanel).borderTopLeftRadius) + gap;
  // O percurso fica inteiramente fora da borda branca, incluindo as duas colunas.
  energyPath.setAttribute('d', `M ${left + radius} ${top}
    H ${right - radius} Q ${right} ${top} ${right} ${top + radius}
    V ${bottom - radius} Q ${right} ${bottom} ${right - radius} ${bottom}
    H ${left + radius} Q ${left} ${bottom} ${left} ${bottom - radius}
    V ${top + radius} Q ${left} ${top} ${left + radius} ${top} Z`);
}

function syncEnergyMotion() {
  const motionAllowed = !energyMotion.matches && !document.hidden;
  energyMain.classList.toggle('energy-active', panelIsVisible && motionAllowed);
  energyMain.classList.toggle('hand-active', handIsVisible && motionAllowed);
  animatedHand.toggleAttribute('active', handIsVisible && motionAllowed);
  animatedHand.toggleAttribute('paused', !handIsVisible || !motionAllowed);
}

const energyVisibility = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.target === budgetPanel) panelIsVisible = entry.isIntersecting;
    else handIsVisible = entry.isIntersecting;
  }
  updateEnergyPath();
  syncEnergyMotion();
}, { threshold: 0 });
energyVisibility.observe(budgetPanel);
energyVisibility.observe(document.querySelector('.robot-motion'));
const energyResize = new ResizeObserver(updateEnergyPath);
energyResize.observe(energyMain);
energyResize.observe(budgetPanel);
window.addEventListener('resize', updateEnergyPath, { passive: true });
energyMotion.addEventListener('change', syncEnergyMotion);
document.addEventListener('visibilitychange', syncEnergyMotion);
updateEnergyPath();

budgetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (isSending) return;
  const fields = Object.fromEntries(new FormData(budgetForm));
  budgetForm.elements.mensagem.setCustomValidity(fields.mensagem.trim() ? '' : 'Descreva seu projeto para continuar.');
  budgetForm.elements.nome.setCustomValidity(fields.nome.trim() ? '' : 'Informe seu nome para continuar.');
  if (!budgetForm.reportValidity()) return;
  requestId ||= crypto.randomUUID();
  isSending = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando…';
  budgetForm.setAttribute('aria-busy', 'true');
  const controls = [...budgetForm.querySelectorAll('input, textarea')];
  controls.forEach(control => { control.readOnly = true; });
  formStatus.dataset.state = 'pending';
  formStatus.textContent = 'Enviando sua solicitação. Aguarde um momento.';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);
  let sent = false;
  try {
    const response = await fetch('api/orcamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify(fields),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true) throw new Error(result?.message || 'O envio está indisponível. Seus dados foram mantidos; tente novamente mais tarde.');
    sent = true;
    formStatus.dataset.state = 'success';
    formStatus.textContent = result.message;
    submitButton.textContent = 'Solicitação enviada';
  } catch (error) {
    formStatus.dataset.state = 'error';
    formStatus.textContent = error instanceof TypeError || error.name === 'AbortError'
      ? 'Não foi possível confirmar o envio. Seus dados foram mantidos. Verifique a conexão e tente novamente.'
      : error.message;
    submitButton.textContent = 'Tentar novamente';
  } finally {
    clearTimeout(timeout);
    isSending = false;
    controls.forEach(control => { control.readOnly = false; });
    budgetForm.removeAttribute('aria-busy');
    submitButton.disabled = sent;
  }
});
budgetForm.addEventListener('input', (event) => {
  if ('setCustomValidity' in event.target) event.target.setCustomValidity('');
  if (isSending) return;
  requestId = null;
  submitButton.disabled = false;
  submitButton.textContent = 'Enviar solicitação';
  formStatus.textContent = '';
  delete formStatus.dataset.state;
});
