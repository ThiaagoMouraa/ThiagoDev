# Envio direto do orçamento

O botão envia nome, e-mail, telefone opcional e mensagem para a API do site. `server.js` valida os dados e usa Nodemailer para enviar por SMTP para `negociosrm1136@gmail.com`. O remetente é a conta configurada no servidor; `Reply-To` aponta para o cliente, permitindo responder ao pedido pelo seu e-mail.

## Configurar e conferir localmente

1. Use Node.js 22.9 ou posterior e execute `npm install` na pasta do projeto.
2. Copie `.env.example` para `.env`. Preencha `SMTP_PASS` e confira os demais valores. O arquivo `.env` está ignorado pelo Git; não envie sua senha no chat ou coloque credenciais no HTML/JavaScript.
3. O exemplo usa Gmail com `smtp.gmail.com`, porta `465` e `SMTP_SECURE=true`. Para essa opção, use uma senha de app de uma conta com verificação em duas etapas, se disponível. Veja as [instruções oficiais do Google](https://support.google.com/accounts/answer/185833?hl=pt-BR). A senha normal da conta não deve ser usada.
4. Para outro provedor SMTP, informe o host, a porta, o usuário, a senha e o remetente autorizado por ele. Porta `587` usa `SMTP_SECURE=false` com STARTTLS obrigatório; porta `465` usa `true`. Consulte a [documentação SMTP do Nodemailer](https://nodemailer.com/smtp).
5. Execute `npm start` e abra `http://localhost:3000/orcamento.html` no preview do VS Code. O Live Server sozinho não executa a API. Sempre reinicie o servidor depois de alterar `.env`.
6. Após configurar a conta, faça um envio de conferência com seus próprios dados. Confirme o recebimento na caixa de entrada/spam e teste o botão Responder. Esse envio real não foi realizado nesta integração.

Se a configuração estiver ausente, a API responde com indisponibilidade; a página conserva os dados e permite nova tentativa. Nunca há confirmação de sucesso simulada no site de produção.

## Hospedagem

A implementação atual exige uma hospedagem que execute Node.js e permita conexões ao SMTP escolhido. Publique o frontend e `/api/orcamento` no mesmo domínio. Copiar somente HTML/CSS/JS para uma hospedagem estática não ativa o envio.

Configure as mesmas variáveis pelo painel privado da hospedagem. Defina `SITE_ORIGIN` como a URL real do site, sem caminho, e `HOST=0.0.0.0` quando a plataforma exigir escuta externa. `PORT` pode ser definido automaticamente pela hospedagem. Não publique `.env`, `.preview`, testes ou `node_modules` como arquivos estáticos.

`TRUST_PROXY=true` só deve ser usado quando houver um proxy confiável que substitui o cabeçalho `X-Forwarded-For`. Por padrão, o limite usa o IP da conexão. Atrás de um proxy, configure isso conforme a plataforma para evitar que visitantes compartilhem o mesmo limite.

## Comportamento e limites

- O botão mostra carregamento e fica bloqueado durante o envio. Os campos ficam temporariamente somente para leitura. Após sucesso, um novo pedido exige editar os dados.
- Falhas de rede/SMTP não apagam o formulário. A mesma solicitação pode ser tentada novamente sem mudar o identificador; isso evita duplicação por repetição de uma resposta perdida.
- A confirmação significa que o SMTP aceitou a mensagem. Entrega na caixa de entrada depende do provedor e da política de spam; o site não afirma ter confirmado leitura ou entrega final.
- A validação existe também no servidor. Há um campo invisível para bots, verificação de origem e limite de seis pedidos válidos por IP em dez minutos.
- Os dados do formulário não são gravados em arquivo nem registrados em logs. O servidor mantém temporariamente identificadores/hash de pedidos e contadores por IP; o conteúdo vai para o provedor de e-mail escolhido.
- A proteção contra duplicação e o limite ficam em memória, por processo, por dez minutos. Em múltiplas instâncias ou após reinício, use um armazenamento compartilhado se precisar dessas garantias entre instâncias.
- Não há fila persistente: uma falha é informada na página para que o visitante tente novamente. O destinatário e o remetente são definidos somente no servidor; o cliente não pode alterá-los.

## Verificações executadas

`npm test` verifica geração do e-mail, destinatário/Reply-To, validação, duplicação simultânea, falhas, configuração ausente, limite de frequência e proteção de arquivos privados. O e-mail é gerado em memória; não há envio real.

`.preview/form-check.cjs` verifica no Edge desktop e celular os estados de carregamento, sucesso, falha com preservação dos campos e nova tentativa, usando um transportador simulado. As prévias ficam em `.preview/form-success-*.png` e `.preview/form-error-*.png`.

Integração apenas local; SMTP real e publicação ainda não configurados.
