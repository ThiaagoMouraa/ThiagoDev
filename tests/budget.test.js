'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const nodemailer = require('nodemailer');
const { createBudgetServer, createSmtpSender, buildMail } = require('../server');

const valid = { nome: 'Cliente de teste', email: 'cliente@example.com', telefone: '(11) 99999-1234', mensagem: 'Preciso de um site.\nCom formulário de contato.', website: '' };
async function fixture(t, options = {}) {
  const server = createBudgetServer({ sendBudgetMail: async () => {}, ...options });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, post: (body = valid, id = randomUUID(), headers = {}) => fetch(base + '/api/orcamento', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json', 'X-Request-Id': id, ...headers }, body: JSON.stringify(body) }) };
}

test('envio direto valida os campos, preserva os dados e aguarda o transportador', async t => {
  const sent = [];
  const { post } = await fixture(t, { sendBudgetMail: async fields => { sent.push(fields); } });
  const response = await post({ ...valid, nome: '  Cliente de teste  ', to: 'intruso@example.com' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].nome, valid.nome);
  assert.equal(sent[0].mensagem, valid.mensagem);
  assert.equal(sent[0].to, undefined);
});

test('e-mail gerado usa remetente fixo, destinatário fixo e Reply-To do cliente', async () => {
  const mail = buildMail(valid, { from: 'site@example.com', to: 'negociosrm1136@gmail.com' });
  assert.equal(mail.from.address, 'site@example.com');
  assert.equal(mail.to, 'negociosrm1136@gmail.com');
  assert.equal(mail.replyTo.address, valid.email);
  for (const value of [valid.nome, valid.email, valid.telefone, valid.mensagem]) assert(mail.text.includes(value));
  const result = await nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' }).sendMail(mail);
  const message = result.message.toString('utf8');
  assert.match(message, /To: negociosrm1136@gmail.com/);
  assert.match(message, /Reply-To: Cliente de teste <cliente@example.com>/);
});

test('solicitações repetidas simultâneas não enviam dois e-mails', async t => {
  let calls = 0;
  const { post } = await fixture(t, { sendBudgetMail: async () => { calls++; await new Promise(resolve => setTimeout(resolve, 50)); } });
  const id = randomUUID();
  const responses = await Promise.all([post(valid, id), post(valid, id)]);
  assert(responses.every(response => response.status === 200));
  assert.equal(calls, 1);
  assert.equal((await post({ ...valid, mensagem: 'Outra ideia.' }, id)).status, 409);
});

test('validação, honeypot e origem bloqueiam solicitações inválidas antes do envio', async t => {
  let calls = 0;
  const { post } = await fixture(t, { sendBudgetMail: async () => { calls++; } });
  for (const changes of [{ nome: '  ' }, { nome: 'Nome\r\nBcc: intruso@example.com' }, { email: 'inválido' }, { mensagem: ' ' }, { mensagem: 'a'.repeat(5001) }, { website: 'spam' }, { telefone: 'texto' }]) {
    assert.equal((await post({ ...valid, ...changes })).status, 400);
  }
  assert.equal((await post(valid, randomUUID(), { Origin: 'https://outro-site.example' })).status, 403);
  assert.equal((await post(valid, randomUUID(), { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal(calls, 0);
});

test('falha SMTP e configuração ausente nunca retornam confirmação de sucesso', async t => {
  const missing = await fixture(t, { sendBudgetMail: null });
  assert.equal((await missing.post()).status, 503);
  const failed = await fixture(t, { sendBudgetMail: async () => { throw new Error('SMTP_AUTH_FAILED'); } });
  const response = await failed.post();
  assert.equal(response.status, 502);
  const result = await response.json();
  assert.equal(result.ok, false);
  assert(!result.message.includes('SMTP_AUTH_FAILED'));
  assert.equal(createSmtpSender({}), null);
});

test('limite de frequência bloqueia abuso e não bloqueia a repetição idempotente', async t => {
  const { post } = await fixture(t, { rateLimit: 2 });
  const id = randomUUID();
  assert.equal((await post(valid, id)).status, 200);
  assert.equal((await post(valid, id)).status, 200);
  assert.equal((await post()).status, 200);
  const response = await post();
  assert.equal(response.status, 429);
  assert(Number(response.headers.get('retry-after')) > 0);
});

test('servidor expõe apenas páginas e assets, protegendo credenciais e código do backend', async t => {
  const { base } = await fixture(t);
  for (const resource of ['/', '/orcamento.html', '/components/hand/robot-hand.js', '/components/hand/assets/robot-hand.png']) {
    assert.equal((await fetch(base + resource)).status, 200);
  }
  for (const resource of ['/.env', '/.env.example', '/server.js', '/package.json', '/.git/config', '/.preview/hand-check.cjs', '/assets/%2e%2e/server.js']) {
    assert.equal((await fetch(base + resource)).status, 404);
  }
  const huge = await fetch(base + '/api/orcamento', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json', 'X-Request-Id': randomUUID() }, body: JSON.stringify({ ...valid, extra: 'x'.repeat(18000) }) });
  assert.equal(huge.status, 413);
});
