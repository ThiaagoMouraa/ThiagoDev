# Mão robótica integrada ao orçamento

Origem: `C:\Users\Thiago\Documents\Codex\2026-10-13\referenced-chatgpt-conversation-this-is-an\outputs\thiagodev-hand\`.

`robot-hand.js` foi copiado do componente fornecido e recebeu somente as adaptações de integração. `assets/robot-hand.png` é uma cópia idêntica ao original, com transparência preservada. A imagem estática anterior permanece intacta em `assets/budget/`.

`orcamento.html` carrega o módulo e renderiza uma única mão no espaço existente. O `index.html` demonstrativo não foi copiado. Abra o site por HTTP, usando o preview/Live Server do VS Code; módulos não funcionam diretamente por `file://`.

O slot `tip-effect` fica na coordenada da ponta (570, 194) do SVG de 815 × 815, dentro de grupos com os mesmos pivôs, duração e movimentos de pulso e indicador usados pela arte. O efeito acompanha esses movimentos e o redimensionamento sem cálculos por quadro. Ele fica fora das máscaras e recortes da imagem.

A base do braço permanece visível até a abertura do portal. As camadas seguem a ordem painel, fundo azul neon do portal, braço e aro frontal; o fundo opaco encobre a borda branca, e o aro frontal esconde o corte inferior. Uma linha neon na mesma paleta azul do portal permanece colada à base, recortada pelo alfa da imagem; apenas o brilho varia suavemente, sem subir pelo braço. O recorte do contêiner termina dentro da abertura, com margem livre para os efeitos acima da mão. No celular, o posicionamento e o recorte acompanham a largura da mão. O contorno neon acompanha a pose animada. O caminho de energia ao redor do formulário e os ciclos dos campos permanecem em `orcamento.js` e `orcamento.css`.

`pause()`, `play()`, o atributo `paused` e `--hand-duration` continuam disponíveis. A integração pausa fora da tela e quando a página está oculta. `prefers-reduced-motion` desativa movimento e energia animada.

O neon do antebraço, da mão e do indicador usa o contorno alfa da imagem original e os mesmos grupos SVG da arte. Assim, cada trecho acompanha sua articulação, sem uma cópia animada independente para calcular o contorno.

Conferência local: `.preview/hand-check.cjs`, usando Playwright com Edge. Verifica alinhamento em cinco fases do ciclo, larguras de 1440, 390 e 320 pixels, ausência de overflow horizontal, formulário, energia externa e movimento reduzido. As prévias estão em `.preview/hand-integrated-*.png`.

A arte é achatada; a articulação sutil mantém a limitação do componente original, sem criar superfícies ou dedos ocultos. Nenhuma publicação foi realizada.
