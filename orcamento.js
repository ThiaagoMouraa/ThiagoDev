'use strict';

const budgetEmail = 'negociosrm1136@gmail.com';
const budgetForm = document.querySelector('#budget-form');
const formStatus = document.querySelector('#form-status');
const requestPreview = document.querySelector('#request-preview');
const requestText = document.querySelector('#request-text');

// Energia azul: mao, contorno externo do painel e cada campo em sequencia.
const energyMain = document.querySelector('#principal');
const budgetPanel = document.querySelector('.budget-panel');
const energyPath = document.querySelector('.panel-energy path');
budgetForm.querySelectorAll('.form-field').forEach((field, index) => {
  field.style.setProperty('--field-delay', `${4.4 + index * .75}s`);
});
const energyMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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

function buildBudgetRequest(fields) {
  return [
    'Olá, Thiago! Gostaria de solicitar um orçamento.',
    `Nome: ${fields.nome.trim()}`,
    `E-mail: ${fields.email.trim()}`,
    `Telefone: ${fields.telefone.trim() || 'Não informado'}`,
    '',
    'Sobre o projeto:',
    fields.mensagem.trim(),
  ].join('\n');
}

budgetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = Object.fromEntries(new FormData(budgetForm));
  const messageField = budgetForm.elements.mensagem;
  messageField.setCustomValidity(fields.mensagem.trim() ? '' : 'Descreva seu projeto para continuar.');
  const nameField = budgetForm.elements.nome;
  nameField.setCustomValidity(fields.nome.trim() ? '' : 'Informe seu nome para continuar.');
  if (!budgetForm.reportValidity()) return;
  const message = buildBudgetRequest(fields);
  requestText.value = message;
  requestPreview.hidden = false;
  const contactLink = requestPreview.querySelector('a');
  contactLink.href = `mailto:${budgetEmail}?subject=${encodeURIComponent('Solicitação de orçamento — Portfólio')}&body=${encodeURIComponent(message)}`;
  formStatus.textContent = `Pedido preparado para ${budgetEmail}. Confirme o envio no seu aplicativo de e-mail. Se ele não abrir, copie a solicitação e envie para esse endereço.`;
  window.location.href = contactLink.href;
});
budgetForm.addEventListener('input', (event) => {
  if ('setCustomValidity' in event.target) event.target.setCustomValidity('');
  requestPreview.hidden = true;
  formStatus.textContent = '';
});
document.querySelector('#copy-request').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(requestText.value);
    formStatus.textContent = `Solicitação copiada. Cole a mensagem em um e-mail para ${budgetEmail}.`;
  } catch {
    requestText.focus();
    requestText.select();
    formStatus.textContent = 'Selecione e copie o texto da solicitação para continuar.';
  }
});
