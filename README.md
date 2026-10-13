# Portfólio — Thiago Moura

Implementação local em HTML, CSS e JavaScript, sem instalação de dependências.

## Abrir no VS Code

1. Abra esta pasta no VS Code e revise os arquivos no Explorer/Source Control.
2. Com a extensão **Live Server** instalada, clique com o botão direito em `index.html` e escolha **Open with Live Server**. Também é possível usar **Go Live** na barra inferior.
3. Confira desktop e mobile, navegação com Tab, fechamento do diálogo com Escape e preferência de movimento reduzido.
4. Clique em **Sobre mim** no menu para abrir `sobre.html`. O link **Inicio** retorna à página principal. Também é possível abrir `sobre.html` diretamente com Live Server.
5. Clique em **Orçamentos** para acessar `orcamento.html` e conferir a mão robótica, a placa neon e o formulário.

## Referência e recursos

Frame original: https://www.figma.com/design/cgpgMJg6v3LnES8gJSBmMl/Site-Profissional?node-id=2017-42

As oito imagens de `assets/` são os recursos originais retornados pelo Figma MCP. Nenhuma captura do frame é usada na página. Foram preservados os textos do frame, inclusive sua grafia. A fonte Inter é carregada pelo Google Fonts; sem conexão, o navegador usa Arial.

As fotos usadas pela página são derivados JPEG em `assets/optimized/`, com largura de 1400 px, proporção preservada e qualidade 88. Origem: `hero.png`, `welcome.png` e `concept.png`, respectivamente. Os arquivos originais permanecem intactos, com os nomes de download fornecidos pelo MCP (a extensão da URL pode diferir do formato interno). As três fotos passaram de aproximadamente 19,8 MB para 782 KB.

| Arquivo | Camada do Figma |
| --- | --- |
| hero.png | 2018:103 |
| rocket.png | 2028:304 |
| welcome.png | 2103:104 |
| concept.png | 2103:110 |
| logo.png | 2024:248 |
| instagram.png | 2024:260 |
| github.png | 2024:254 |
| whatsapp.png | 2024:257 |

## Página Sobre mim

Referência: https://www.figma.com/design/cgpgMJg6v3LnES8gJSBmMl/Site-Profissional?node-id=2031-848

`sobre.html` e `sobre.css` implementam o retrato, a apresentação, a faixa cinza de Competências e a seção Missão!, reutilizando `styles.css`, `script.js` e os recursos do rodapé. As bordas acompanham o recorte das fotos. As revelações se repetem ao rolar em ambas as direções e respeitam movimento reduzido.

As três novas imagens originais permanecem intactas em `assets/about/`. Os derivados JPEG da mesma pasta têm qualidade 88, largura máxima de 1200 px e proporção preservada. Nenhuma captura do frame é usada como recurso de produção.

| Original | Derivado usado | Camada do Figma |
| --- | --- | --- |
| thiago-original.png | thiago.jpg | 2032:889 |
| skills-original.png | skills.jpg | 2038:901 |
| mission-original.png | mission.jpg | 2038:903 |

A seção Missão! inclui os dois parágrafos fornecidos pelo proprietário, alinhados abaixo do título na coluna ao lado da imagem. No mobile, o título e o texto ficam juntos acima da imagem. Os parágrafos usam as mesmas animações de revelação do restante da página.

## Pendências de conteúdo

Os links das redes enviados pelo proprietário estão no HTML e funcionam sem JavaScript. Fale comigo, no menu e no botão principal, abre diretamente https://web.whatsapp.com/. Esse endereço abre o WhatsApp Web; não inicia uma conversa com um número específico. GitHub abre https://github.com/ e Instagram abre o perfil informado. Orçamentos abre `orcamento.html`.

## Página de orçamento

Referência: https://www.figma.com/design/cgpgMJg6v3LnES8gJSBmMl/Site-Profissional?node-id=2028-372

`orcamento.html`, `orcamento.css` e `orcamento.js` seguem o frame atualizado, com oito blocos atrás da mão e painel em duas colunas. A mão permanece parada. Uma luz percorre seu contorno neon, usando uma máscara SVG obtida da transparência da própria imagem original, sem alterar o arquivo. O brilho na ponta do dedo cresce e se expande em dois anéis, sem descer ao formulário. A corrente percorre o contorno e os espaços entre os campos, com percurso responsivo. Os efeitos respeitam movimento reduzido e param fora da tela ou em abas ocultas. Estrelas cadentes mais visíveis ficam atrás do conteúdo. O conjunto foi elevado, com espaços iguais acima e abaixo; a plaquinha e a seta foram ampliadas. O título Faça já o seu orçamento e a seta centralizada abaixo dos textos têm acabamento neon. Os parágrafos usam tamanho consistente, com títulos maiores. No mobile, o formulário fica abaixo da apresentação e a seta aponta para baixo. A preferência de movimento reduzido desativa os movimentos e oculta as estrelas cadentes.

A imagem original da camada 2170:32 está preservada em `assets/budget/robot-hand.png` (2500 × 2500). A página usa `robot-hand-optimized.png` (1400 × 1400), uma cópia PNG com proporção e transparência preservadas. Nenhuma captura do frame é usada em produção. O componente ButtonDanger não existe neste projeto; o botão reutiliza os estilos HTML/CSS já existentes.

O formulário mantém Nome, E-mail, Telefone opcional e Mensagem, com validação nativa e uma área de mensagem maior e redimensionável. O último campo permanece dentro da coluna, sem largura fixa. O frame atualizado contém dois campos de Telefone; a implementação mantém um único campo para evitar informação duplicada.

O destino do formulário é `negociosrm1136@gmail.com`, configurado em `budgetEmail` em `orcamento.js`. Enviar por e-mail valida os campos e abre o aplicativo de e-mail com destinatário, assunto e todas as informações preenchidas. O visitante precisa confirmar o envio no aplicativo. Se não houver aplicativo configurado, ou se uma mensagem longa exceder o limite do aplicativo, é possível copiar a solicitação e enviá-la manualmente. Nenhum dado é salvo pelo site. Envio automático pelo site exige um backend ou serviço de formulários; não foi configurado um serviço externo nem foram adicionadas credenciais ao JavaScript.

Projetos agora abre `projetos.html`, com o Thiago Dev Workbench em destaque.

As animações usam transform/opacity e IntersectionObserver. O conteúdo continua visível sem JavaScript; `prefers-reduced-motion` desativa os movimentos. Os oito blocos do foguete são decorativos, não cards de projetos.

O foguete flutua suavemente em ciclos de oito segundos, preservando sua inclinação original, sem botão de pausa conforme solicitado. A preferência de movimento reduzido desativa a flutuação. O título Nova visão! permanece em uma linha, com tamanho adaptado ao mobile.

Atualização do frame: seção Nova visão! com o novo texto, faixa cinza em toda a largura e imagem de Conceito Profissional com cantos arredondados. Os espaçamentos dessas seções seguem a referência atualizada; links e animações existentes foram preservados.

Textos e imagens reaparecem em sequência sempre que retornam à tela, ao rolar para baixo ou para cima. O efeito reinicia somente após o elemento sair completamente da área visível. Os contatos têm revelação mais lenta (1,6 segundo), escalonamento entre ícones e hover/foco suaves. Elementos focados por teclado permanecem visíveis.


Ajuste do neon no orcamento: a mao usa brilho e contorno azuis. A corrente percorre por fora da borda branca do painel completo (textos e formulario), depois contorna Nome, E-mail, Telefone e Mensagem em sequencia. O caminho externo acompanha o tamanho do painel; os campos preservam os estados de foco e erro.


## Página de Projetos

`projetos.html` e `projetos.css` apresentam o Thiago Dev Workbench em um card com arte ilustrativa original em HTML/CSS, sem usar screenshots como imagens. A borda neon azul aparece no hover e no foco do teclado. O card leva ao resumo local; o contato leva ao orçamento. Os links de Projetos foram integrados ao menu das outras páginas.

As 38 partículas azuis usam CSS com ciclos suaves de escala e opacidade. A camada fica recortada na seção do título e subtítulo, acima do card. A página adapta as duas colunas ao celular e respeita movimento reduzido. As imagens originais permanecem intactas.

Ainda faltam informações fornecidas pelo proprietário: finalidade, funcionalidades, tecnologias e URL real do Workbench. O texto sinaliza essa pendência; a composição no card está identificada como ilustrativa.


Padrao de navegacao: as quatro paginas usam os mesmos cinco links, hover azul claro (#67d8ff) e aria-current="page" no destino atual. No orcamento, titulo, textos de apresentacao, placa neon, seta, botao e estrelas usam a paleta azul de Projetos. O botao tem texto escuro para manter contraste, e os erros do formulario preservam sua sinalizacao.
