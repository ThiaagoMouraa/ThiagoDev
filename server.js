'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const nodemailer = require('nodemailer');

const root = __dirname;
const ownerEmail = 'negociosrm1136@gmail.com';
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const pages = new Set(['index.html', 'sobre.html', 'projetos.html', 'orcamento.html', 'styles.css', 'sobre.css', 'projetos.css', 'orcamento.css', 'script.js', 'orcamento.js']);

function validateBudget(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Preencha os dados do formulário.');
  const fields = {};
  for (const [name, max] of Object.entries({ nome: 100, email: 254, telefone: 30, mensagem: 5000, website: 200 })) {
    const value = body[name] ?? '';
    if (typeof value !== 'string' || value.length > max) throw new Error('Confira o tamanho e o conteúdo dos campos.');
    fields[name] = value.trim();
  }
  if (fields.website) throw new Error('Não foi possível validar a solicitação.');
  if (!fields.nome || /[\x00-\x1f\x7f]/.test(fields.nome)) throw new Error('Informe seu nome.');
  if (!emailPattern.test(fields.email) || /[\x00-\x1f\x7f]/.test(fields.email)) throw new Error('Informe um e-mail válido.');
  if (fields.telefone && !/^[+()\d .-]+$/.test(fields.telefone)) throw new Error('Confira o telefone, incluindo o DDD.');
  if (!fields.mensagem || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(fields.mensagem)) throw new Error('Descreva seu projeto.');
  return fields;
}

function buildMail(fields, config) {
  return {
    from: { name: 'ThiagoDev', address: config.from },
    to: config.to,
    replyTo: { name: fields.nome, address: fields.email },
    subject: 'Novo pedido de orçamento | ThiagoDev',
    text: ['Novo pedido recebido pelo site ThiagoDev.', '', `Nome: ${fields.nome}`, `E-mail: ${fields.email}`, `Telefone: ${fields.telefone || 'Não informado'}`, '', 'Sobre o projeto:', fields.mensagem].join('\n'),
    disableFileAccess: true,
    disableUrlAccess: true,
  };
}

function createSmtpSender(env = process.env) {
  const from = env.MAIL_FROM || env.SMTP_USER;
  const to = env.BUDGET_TO || ownerEmail;
  const port = Number(env.SMTP_PORT || 465);
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !emailPattern.test(from || '') || !emailPattern.test(to) || !Number.isInteger(port) || port < 1 || port > 65535) return null;
  const secure = env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465;
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST, port, secure, requireTLS: !secure,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    disableFileAccess: true, disableUrlAccess: true,
  });
  return async fields => {
    const result = await transport.sendMail(buildMail(fields, { from, to }));
    if (!result.accepted?.some(address => address.toLowerCase() === to.toLowerCase())) throw new Error('SMTP_REJECTED');
  };
}

function json(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify({ ok: status === 200, message }));
}

async function readBody(req) {
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 16384) throw new Error('BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function createBudgetServer({ sendBudgetMail = createSmtpSender(), siteOrigin = process.env.SITE_ORIGIN || '', trustProxy = process.env.TRUST_PROXY === 'true', rateLimit = 6 } = {}) {
  const rates = new Map();
  const requests = new Map();
  const windowMs = 10 * 60 * 1000;
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api/orcamento') {
        if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, 'Use o formulário para enviar sua solicitação.'); }
        let origin;
        try { origin = new URL(req.headers.origin); } catch { return json(res, 403, 'Recarregue a página para enviar.'); }
        const originAllowed = siteOrigin ? origin.origin === new URL(siteOrigin).origin : ['http:', 'https:'].includes(origin.protocol) && origin.host === req.headers.host;
        if (!originAllowed) return json(res, 403, 'Recarregue a página para enviar.');
        if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') return json(res, 415, 'Formato de solicitação inválido.');
        const now = Date.now();
        for (const [key, value] of rates) if (value.expires <= now) rates.delete(key);
        for (const [key, value] of requests) if (value.expires <= now && !value.pending) requests.delete(key);
        const ip = trustProxy ? String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim() : req.socket.remoteAddress;
        let fields;
        try { fields = validateBudget(await readBody(req)); }
        catch (error) { return json(res, error.message === 'BODY_TOO_LARGE' ? 413 : 400, error instanceof SyntaxError ? 'Confira os dados do formulário.' : error.message); }
        const id = req.headers['x-request-id'];
        if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{16,64}$/.test(id)) return json(res, 400, 'Recarregue a página para enviar.');
        const signature = createHash('sha256').update(JSON.stringify(fields)).digest('hex');
        const previous = requests.get(id);
        if (previous) {
          if (previous.signature !== signature) return json(res, 409, 'Os dados foram alterados. Envie novamente.');
          await previous.promise;
          return json(res, 200, 'Solicitação enviada! Vou retornar pelo contato informado.');
        }
        if (!sendBudgetMail) return json(res, 503, 'O envio está temporariamente indisponível. Seus dados foram mantidos; tente novamente mais tarde.');
        const rate = rates.get(ip) || { count: 0, expires: now + windowMs };
        if (rate.count >= rateLimit || rates.size >= 5000 || requests.size >= 5000) {
          res.setHeader('Retry-After', String(Math.max(1, Math.ceil((rate.expires - now) / 1000))));
          return json(res, 429, 'Muitas solicitações em pouco tempo. Aguarde alguns minutos antes de tentar novamente.');
        }
        rate.count++;
        rates.set(ip, rate);
        const entry = { signature, expires: now + windowMs, pending: true, promise: Promise.resolve().then(() => sendBudgetMail(fields)) };
        requests.set(id, entry);
        try { await entry.promise; entry.pending = false; }
        catch { requests.delete(id); return json(res, 502, 'Não foi possível enviar agora. Seus dados foram mantidos; tente novamente em alguns minutos.'); }
        return json(res, 200, 'Solicitação enviada! Vou retornar pelo contato informado.');
      }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
      let resource;
      try { resource = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html'; }
      catch { res.writeHead(400).end(); return; }
      const extension = path.extname(resource).toLowerCase();
      const safeSegments = !resource.includes('\\') && !resource.split('/').some(segment => segment.startsWith('.'));
      const publicAsset = /^(assets|components)\//.test(resource) && extension !== '.html' && Boolean(mime[extension]);
      if (!safeSegments || (!pages.has(resource) && !publicAsset)) { res.writeHead(404).end(); return; }
      const filename = path.resolve(root, resource);
      if (!filename.startsWith(root + path.sep)) { res.writeHead(404).end(); return; }
      const data = await fs.readFile(filename);
      res.writeHead(200, { 'Content-Type': mime[extension], 'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=300' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'EISDIR') { res.writeHead(404).end(); return; }
      if (!res.headersSent) json(res, 502, 'Não foi possível enviar agora. Seus dados foram mantidos; tente novamente em alguns minutos.');
      else res.end();
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  return server;
}

if (require.main === module) {
  const sender = createSmtpSender();
  if (!sender) console.warn('SMTP não configurado. O formulário mostrará indisponibilidade até preencher as variáveis do servidor.');
  const port = Number(process.env.PORT || 3000);
  createBudgetServer({ sendBudgetMail: sender }).listen(port, process.env.HOST || '127.0.0.1', () => console.log(`ThiagoDev local: http://localhost:${port}`));
}

module.exports = { createBudgetServer, createSmtpSender, buildMail, validateBudget };
