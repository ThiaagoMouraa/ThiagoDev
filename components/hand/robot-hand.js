// ThiagoDev robotic hand. No dependencies. Paths resolve relative to this module.
const asset = new URL('./assets/robot-hand.png', import.meta.url).href;
class RobotHand extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    // Cada trecho do contorno fica dentro da própria articulação da imagem.
    const neon = `<foreignObject class="neon" width="815" height="815" mask="url(#hand-contour)"><div class="orbit"></div></foreignObject>`;
    root.innerHTML = `<style>
      :host{display:block;width:100%;--hand-duration:7s}
      svg{display:block;width:100%;height:auto;overflow:visible}
      .wrist{transform-origin:230px 575px;animation:wrist var(--hand-duration) ease-in-out infinite}
      .finger{transform-origin:378px 334px;animation:finger var(--hand-duration) ease-in-out infinite}
      .artwork{filter:drop-shadow(0 0 4px #67d8ff70) drop-shadow(0 0 14px #238cff60)}
      .neon{opacity:0;pointer-events:none;filter:drop-shadow(0 0 3px #67d8ff) drop-shadow(0 0 8px #238cff80)}
      .orbit{width:100%;height:100%;background:conic-gradient(from var(--energy-angle) at 55% 50%,transparent 0deg 280deg,#238cff70 314deg,#67d8ff 338deg,#f3fcff 347deg,transparent 355deg)}
      .tip-anchor{position:relative;width:100%;height:100%;overflow:visible}
      foreignObject{overflow:visible}
      :host([active]) .neon{opacity:.75}
      :host([active]) .orbit{animation:hand-orbit 8s linear infinite}
      @keyframes hand-orbit{to{--energy-angle:360deg}}
      @keyframes wrist{0%,100%{transform:rotate(0deg)}35%{transform:rotate(-2deg)}70%{transform:rotate(2deg)}}
      @keyframes finger{0%,100%{transform:rotate(0deg)}35%{transform:rotate(3deg)}70%{transform:rotate(-1deg)}}
      :host([paused]) *{animation-play-state:paused!important}
      @media(prefers-reduced-motion:reduce){*{animation:none!important}.neon{opacity:0!important}}
    </style>
    <svg viewBox="0 0 815 815" role="img" aria-label="Mão robótica com movimento suave de pulso e indicador" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="hand-edge" x="-10%" y="-10%" width="120%" height="120%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="outer"/>
          <feComposite in="outer" in2="SourceAlpha" operator="out" result="rim"/>
          <feFlood flood-color="white"/><feComposite in2="rim" operator="in"/>
        </filter>
        <mask id="hand-contour" maskUnits="userSpaceOnUse" x="0" y="0" width="815" height="815"><image href="${asset}" width="815" height="815" filter="url(#hand-edge)"/></mask>
        <clipPath id="forearm"><path d="M0 815H815V790L280 590 193 548 0 548Z"/></clipPath>
        <clipPath id="upper"><path d="M0 0H815V790L280 590 193 548 0 548Z"/></clipPath>
        <clipPath id="index"><path d="M360 335L374 307 440 258 590 166 606 208 488 308 398 356Z"/></clipPath>
        <mask id="body" maskUnits="userSpaceOnUse" x="0" y="0" width="815" height="815"><rect width="815" height="815" fill="white"/><path d="M360 335L374 307 440 258 590 166 606 208 488 308 398 356Z" fill="black"/></mask>
      </defs>
      <g class="artwork">
        <g id="hand-pose">
          <image href="${asset}" width="815" height="815" clip-path="url(#forearm)"/>
          <g clip-path="url(#forearm)">${neon}</g>
          <g class="wrist" clip-path="url(#upper)">
            <image href="${asset}" width="815" height="815" mask="url(#body)"/>
            <g mask="url(#body)">${neon}</g>
            <g class="finger">
              <image href="${asset}" width="815" height="815" clip-path="url(#index)"/>
              <g clip-path="url(#index)">${neon}</g>
            </g>
          </g>
        </g>
      </g>
      <!-- O efeito usa os mesmos pivôs e ciclos da arte, fora dos recortes. -->
      <g class="wrist">
        <g class="finger">
          <foreignObject x="470" y="94" width="200" height="200"><div class="tip-anchor"><slot name="tip-effect"></slot></div></foreignObject>
        </g>
      </g>
    </svg>`;
  }
  pause() { this.setAttribute('paused', ''); }
  play() { this.removeAttribute('paused'); }
}
if (!customElements.get('robot-hand')) customElements.define('robot-hand', RobotHand);

