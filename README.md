# Enquanto Vivo — Central de Marca · Conceito 3

Site estático de página única (mesmo formato da referência
`diegoluciano.github.io/enquantovivo`), com a identidade adequada ao **Conceito 3**
(selo circular · verde profundo `#0D160E` · verde-sálvia `#D8DDB8` · branco).

## Rodar localmente

```bash
cd "Conceito 3/site"
python3 -m http.server 4188
# abrir http://localhost:4188
```

Também funciona abrindo `index.html` direto, mas via servidor as fontes e o
GSAP carregam de forma mais previsível. Deploy: subir a pasta inteira em
qualquer host estático (GitHub Pages, Netlify…).

## Estrutura

```
site/
├── index.html            página única, 9 seções + hero
├── assets/
│   ├── css/style.css      paleta em CSS custom props no :root
│   ├── js/
│   │   ├── main.js        interações + timelines GSAP
│   │   └── vendor/        gsap 3.13 + ScrollTrigger + DrawSVGPlugin (locais)
│   ├── svg/               logo / símbolo / avatar / assinatura-simplificada — cada um em 3 cores
│   ├── fonts/             Google Sans (.woff2) — ver LEIA-ME.txt; fallback de sistema sem os arquivos
│   └── img/               imagens conceituais (IA: Higgsfield/Recraft) + channel-cover.jpg (foto real do canal, Roraima)
├── downloads/             arquivos servidos nos botões "Baixar":
│   ├── *.svg                       selo / símbolo / avatar / assinatura simplificada
│   ├── enquantovivo-png.zip        PNG transparente @1x/@2x/@4x dos 8 SVGs
│   ├── enquantovivo-pdf.zip        PDF vetorial dos 8 SVGs
│   ├── logo-animado.html           animação GSAP do selo (loop) — abrir no navegador
│   ├── logo-animado/               MP4 + WebM(alpha) + GIF, versões branca e escura
│   ├── enquantovivo-logo-animado.zip
│   ├── logo-bumper.html            selo de vídeo (scrim 20% + monta/desmonta) sobre transparente
│   ├── selo-video/                 ProRes 4444 (alpha) + sequência PNG + prévia .mp4 (branca/escura)
│   └── enquantovivo-selo-video.zip
├── guia-feed.html         guia de ritmo do feed (Templates sociais → "Abrir ↗" nos Downloads)
├── exports/               saída bruta do gerador de PNG/PDF (não precisa versionar)
└── svg/                   pasta original entregue (intocada)
```

### Gerar de novo os derivados (scratchpad, fora do repo)

- **PNG + PDF:** `node tools/export-png-pdf.mjs` (headless Chrome; lê `assets/svg/`, escreve `exports/` e os `.zip` em `downloads/`).
- **Assinatura do autor:** `node tools/build-assinatura-autor.mjs` → selo + "Fábio Mendonça" + título em **Google Sans (texto vivo, editável)**. Nome/título no topo do script.
- **Logo animado:** `node tools/build-logo-animado-html.mjs` (regenera o HTML embutindo os SVGs), depois `bash tools/build-logo-animado.sh` (frames via Chrome → MP4/GIF/MOV(alpha)/APNG). Efeito: símbolo surge → anel letra por letra → sol nasce por trás da montanha.
- **Selo de vídeo (bumper):** `node tools/build-selo-video-html.mjs` (gera `downloads/logo-bumper.html`), depois `node tools/build-selo-video.mjs` (puppeteer-core @1920×1080/24fps → ProRes 4444 `yuva444p10le` com alpha + sequência PNG + prévia H.264 sobre foto). Efeito: scrim `#0D160E` entra a 20% → selo monta → segura → **desmonta ao contrário** → scrim sai. WebM VP9-alpha não sai neste ffmpeg — a sequência PNG cobre esse caso.

## GSAP — o que está animado

| Alvo | Efeito |
|---|---|
| Hero | selo `<svg>` inline anima uma vez com a intro: símbolo surge → anel letra por letra → sol nasce. Sem anel decorativo. Moldura desenhada (DrawSVG). |
| Selo | leve deslocamento vertical no scroll (sem rotação — marca circular) |
| Foto do hero | parallax vertical no scroll |
| Seções | `[data-reveal-child]` sobem com fade em stagger ao entrar na viewport |
| Fotos (direção / mockups) | parallax leve |
| `prefers-reduced-motion` | tudo desligado, conteúdo visível |


## Pendências (sinalizadas como "Em preparação" no site)

- Entregue: selo completo, símbolo isolado, avatar de perfil circular, **assinatura do
  autor** (selo + Fábio Mendonça + título) — 3 cores cada. + pacotes **PNG** e **PDF**. + **logo animado** (MP4/GIF/MOV/APNG).
- Assinatura do autor: texto vivo em Google Sans; título "Viajante · Canal Enquanto Vivo" a confirmar.
- Prancha oficial de construção/proporções (os valores atuais são referência)
- **Google Sans** é a tipografia oficial da marca (títulos + texto). Arquivos `.woff2`
  em `assets/fonts/` — enquanto não estiverem lá, cai no fallback de sistema. Conferir
  direitos de uso/embed da Google Sans antes de publicar.
- **Nexa Rust Sans** — citada nos vetores do logotipo; uso restrito ao logo, arquivo/licença ainda não fornecidos
- Ainda pendente: **EPS** e **editáveis (.ai)** (precisam de Illustrator/Inkscape), vinheta/legendas/pacote de vídeo
- Imagens em `assets/img/` são **simulações geradas por IA** para direção visual —
  substituir pelo acervo real do Fábio Mendonça (ou refinar via Magnific/Higgsfield).

## Paleta

| Nome | HEX | RGB |
|---|---|---|
| Verde profundo | `#0D160E` | 13 · 22 · 14 |
| Verde-sálvia | `#D8DDB8` | 216 · 221 · 184 |
| Branco | `#FFFFFF` | 255 · 255 · 255 |
| Off-white interface (funcional, fora da paleta) | `#F4F3EB` | — |
