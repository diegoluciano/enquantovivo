"use client";

import { useEffect, useRef, useState } from "react";
import { brandAssets, pendingGroups } from "./brand-data";

const navigation = [
  ["visao-geral", "Visão geral"],
  ["marca", "Marca"],
  ["cores", "Cores"],
  ["tipografia", "Tipografia"],
  ["aplicacoes", "Aplicações"],
  ["video", "Vídeo"],
  ["mockups", "Mockups"],
  ["downloads", "Downloads"],
] as const;

const essence = [
  ["01", "Presença", "Estar verdadeiramente presente no lugar, no momento e na experiência."],
  ["02", "Caminho", "Valorizar o percurso e tudo aquilo que acontece antes da chegada."],
  ["03", "Contemplação", "Observar a natureza com tempo, profundidade e silêncio."],
  ["04", "Memória", "Registrar experiências para que elas continuem vivas."],
];

const wrongUses = [
  ["Distorcer", "wrong-stretch"],
  ["Rotacionar", "wrong-rotate"],
  ["Aplicar sombra", "wrong-shadow"],
  ["Reduzir contraste", "wrong-fade"],
];

function AssetPreview({
  asset,
  compact = false,
}: {
  asset: (typeof brandAssets)[number];
  compact?: boolean;
}) {
  return (
    <img
      src={asset.path}
      alt={`Versão oficial ${asset.name} da marca Enquanto Vivo`}
      className={compact ? "asset-image compact" : "asset-image"}
      loading="lazy"
    />
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("visao-geral");
  const [scrolled, setScrolled] = useState(false);
  const [lightboxAsset, setLightboxAsset] = useState<(typeof brandAssets)[number] | null>(null);
  const [copied, setCopied] = useState("");
  const [watermarkOpacity, setWatermarkOpacity] = useState(42);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-28% 0px -62% 0px", threshold: [0.05, 0.3, 0.6] },
    );

    navigation.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!lightboxAsset) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxAsset(null);
      if (event.key === "Tab") {
        const focusable = Array.from(
          document.querySelectorAll<HTMLElement>(".lightbox-content button, .lightbox-content a"),
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxAsset]);

  const copyColor = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(""), 1600);
  };

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a className="header-mark" href="#topo" aria-label="Enquanto Vivo — voltar ao início">
          <img src="/assets/brand/symbols/cimbolo preto.svg" alt="" />
          <span>Enquanto Vivo</span>
        </a>
        <nav id="mobile-navigation" className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
          {navigation.map(([id, label]) => (
            <a
              href={`#${id}`}
              key={id}
              className={activeSection === id ? "is-active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? "Fechar" : "Menu"}
        </button>
      </header>

      <main id="topo">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Canal Enquanto Vivo · Diretrizes 2026</p>
            <h1>Central<br />de Marca</h1>
            <p className="hero-description">
              Diretrizes, aplicações e arquivos oficiais da identidade visual do canal Enquanto Vivo.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#aplicacoes">Ver aplicações</a>
              <a className="button button-light" href="#downloads">Baixar arquivos</a>
            </div>
          </div>
          <div className="hero-art" aria-label="Área reservada para fotografia oficial de abertura">
            <div className="hero-logo-stage">
              <img src="/assets/brand/logos/branca completa.svg" alt="Logo completo branco do Enquanto Vivo" />
            </div>
            <div className="hero-art-meta">
              <span>Fotografia oficial</span>
              <span>Arquivo em preparação</span>
            </div>
          </div>
        </section>

        <section className="section overview" id="visao-geral">
          <div className="section-index">01 / Visão geral</div>
          <div className="overview-grid">
            <h2>Viver é<br />o caminho.</h2>
            <div className="large-copy">
              <p>
                O Enquanto Vivo acompanha viagens, caminhos, paisagens e experiências registradas por Fábio Henrique.
                Sua identidade visual representa uma relação pessoal com a natureza, o tempo, o movimento e as histórias
                construídas durante cada percurso.
              </p>
              <p className="note">
                Esta Central de Marca reúne os elementos oficiais da identidade e orienta sua utilização em diferentes
                formatos e plataformas.
              </p>
            </div>
          </div>
          <div className="essence-grid" aria-label="Essência da marca">
            {essence.map(([number, title, copy]) => (
              <article key={title} className="essence-item">
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-dark brand-section" id="marca">
          <div className="section-index">02 / Marca</div>
          <div className="brand-intro">
            <div>
              <p className="eyebrow">Assinatura principal</p>
              <h2>Uma marca para<br />estar no percurso.</h2>
            </div>
            <p>
              As pranchas abaixo usam exclusivamente os vetores oficiais entregues. Nenhuma proporção, assinatura ou
              composição foi reconstruída pela interface.
            </p>
          </div>
          <button
            className="primary-logo-stage"
            type="button"
            onClick={() => setLightboxAsset(brandAssets[0])}
            aria-label="Ampliar logo completo branco"
          >
            <AssetPreview asset={brandAssets[0]} />
            <span>Ampliar assinatura</span>
          </button>
          <div className="asset-grid">
            {brandAssets.map((asset) => (
              <article className={`asset-card ${asset.theme}`} key={asset.id}>
                <button type="button" onClick={() => setLightboxAsset(asset)} aria-label={`Ampliar ${asset.name}`}>
                  <AssetPreview asset={asset} compact />
                </button>
                <div className="asset-card-meta">
                  <div>
                    <h3>{asset.name}</h3>
                    <p>{asset.kind} · {asset.format}</p>
                  </div>
                  <a href={asset.path} download>Baixar</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section technical-section">
          <div className="section-index">03 / Diretrizes técnicas</div>
          <div className="technical-grid">
            <div>
              <p className="eyebrow">Construção e proporções</p>
              <h2>Precisão antes<br />da aplicação.</h2>
            </div>
            <div className="pending-panel">
              <span className="status">Conteúdo pendente</span>
              <p>
                Área de proteção, tamanho mínimo, alinhamentos e unidade de medida ainda não foram fornecidos.
                Esta seção está preparada para receber a prancha técnica oficial, sem deduções automáticas.
              </p>
              <div className="protection-placeholder" aria-hidden="true">
                <div><img src="/assets/brand/symbols/cimbolo preto.svg" alt="" /></div>
              </div>
            </div>
          </div>

          <div className="wrong-uses">
            <div className="subsection-heading">
              <h3>Usos incorretos</h3>
              <p>Não altere a integridade, proporção ou contraste dos arquivos oficiais.</p>
            </div>
            <div className="wrong-grid">
              {wrongUses.map(([label, className]) => (
                <article key={label}>
                  <div className="wrong-preview">
                    <img className={className} src="/assets/brand/symbols/cimbolo preto.svg" alt="" />
                    <span aria-hidden="true">×</span>
                  </div>
                  <p>{label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section colors-section" id="cores">
          <div className="section-index">04 / Cores</div>
          <div className="section-heading">
            <h2>Preto.<br />Branco.<br />Presença.</h2>
            <p>
              Os vetores entregues confirmam aplicações monocromáticas. Valores adicionais de impressão não foram
              definidos nesta Central.
            </p>
          </div>
          <div className="color-list">
            {[
              ["Preto", "#080808", "8, 8, 8", "dark"],
              ["Branco", "#FFFFFF", "255, 255, 255", "light"],
            ].map(([name, hex, rgb, theme]) => (
              <article className={`color-row ${theme}`} key={name}>
                <div className="color-name"><span>{name}</span><strong>{hex}</strong></div>
                <div className="color-meta">
                  <span>RGB {rgb}</span>
                  <button type="button" onClick={() => copyColor(hex)}>
                    {copied === hex ? "Copiado" : "Copiar HEX"}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p className="interface-note">
            O off-white usado no entorno é uma cor funcional da interface e não integra a paleta oficial da marca.
          </p>
        </section>

        <section className="section typography-section" id="tipografia">
          <div className="section-index">05 / Tipografia</div>
          <div className="type-grid">
            <div>
              <p className="eyebrow">Tipografia oficial encontrada nos vetores</p>
              <h2>Gill Sans</h2>
              <p className="type-note">
                Família referenciada nos arquivos SVG oficiais. O arquivo de fonte e as regras definitivas de peso e
                licenciamento ainda não foram fornecidos.
              </p>
            </div>
            <div className="type-specimen">
              <p className="type-display">Enquanto Vivo</p>
              <p className="type-phrase">O caminho também faz parte da história.</p>
              <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
              <p>abcdefghijklmnopqrstuvwxyz</p>
              <p>0123456789 — ÁÉÍÓÚ Ç ÃÕ</p>
              <span>Visualização com fallback do sistema quando Gill Sans não estiver instalada.</span>
            </div>
          </div>
          <div className="interface-type">
            <span>Tipografia funcional da interface</span>
            <p>Arial / Helvetica · apoio neutro para navegação, textos e informações técnicas.</p>
          </div>
        </section>

        <section className="section section-dark applications-section" id="aplicacoes">
          <div className="section-index">06 / Aplicações</div>
          <div className="section-heading">
            <h2>Contraste preserva<br />a assinatura.</h2>
            <p>Utilize sempre a versão que ofereça maior contraste e preserve a leitura da assinatura.</p>
          </div>
          <div className="background-applications">
            <article className="application-light">
              <img src="/assets/brand/logos/preta completa.svg" alt="Logo preto aplicado sobre fundo claro" />
              <div><span>Fundo claro</span><span>Versão positiva</span></div>
            </article>
            <article className="application-dark">
              <img src="/assets/brand/logos/branca completa.svg" alt="Logo branco aplicado sobre fundo escuro" />
              <div><span>Fundo escuro</span><span>Versão negativa</span></div>
            </article>
          </div>
          <div className="photo-direction">
            <div>
              <p className="eyebrow">Direção fotográfica</p>
              <h3>Paisagem, escala,<br />luz e silêncio.</h3>
            </div>
            <div className="photo-placeholder">
              <span>Fotografias oficiais ainda não disponíveis</span>
              <p>
                As imagens devem valorizar a dimensão da paisagem e a experiência de estar nela. A presença humana pode
                aparecer de forma discreta, reforçando a relação entre o viajante, o caminho e o ambiente.
              </p>
            </div>
          </div>
        </section>

        <section className="section video-section" id="video">
          <div className="section-index">07 / Vídeo e plataformas</div>
          <div className="section-heading">
            <h2>Da paisagem<br />à tela.</h2>
            <p>Estruturas preparadas para receber os arquivos oficiais de YouTube, vídeo e formatos verticais.</p>
          </div>
          <div className="format-grid">
            <article className="youtube-frame">
              <div className="frame-top"><span>YouTube</span><span>2560 × 1440</span></div>
              <div className="safe-area">
                <img src="/assets/brand/logos/branca completa.svg" alt="Simulação da área segura do banner com o logo oficial" />
                <span>Área segura · layout final pendente</span>
              </div>
            </article>
            <article className="vertical-frame">
              <div className="vertical-safe">
                <img src="/assets/brand/symbols/simbolo branco.svg" alt="Símbolo branco em simulação de formato vertical" />
                <span>1080 × 1920</span>
              </div>
              <p>Stories · Reels · Shorts<br /><small>Templates oficiais em preparação</small></p>
            </article>
          </div>
          <div className="watermark-section">
            <div>
              <p className="eyebrow">Simulação de watermark</p>
              <h3>Controle apenas de visualização.</h3>
              <label htmlFor="watermark-opacity">Opacidade <span>{watermarkOpacity}%</span></label>
              <input
                id="watermark-opacity"
                type="range"
                min="12"
                max="100"
                value={watermarkOpacity}
                onChange={(event) => setWatermarkOpacity(Number(event.target.value))}
              />
            </div>
            <div className="watermark-stage">
              <span>Prévia horizontal · posicionamento não definitivo</span>
              <img
                src="/assets/brand/symbols/simbolo branco.svg"
                alt="Símbolo branco usado como prévia de marca d'água"
                style={{ opacity: watermarkOpacity / 100 }}
              />
            </div>
          </div>
          <div className="pending-strip">
            {["Vinheta", "Logo animado", "Legendas", "Abertura", "Encerramento"].map((item) => (
              <div key={item}><span>{item}</span><em>Em preparação</em></div>
            ))}
          </div>
        </section>

        <section className="section mockups-section" id="mockups">
          <div className="section-index">08 / Mockups</div>
          <div className="section-heading">
            <h2>Aplicações reais,<br />quando estiverem prontas.</h2>
            <p>Nenhum mockup fictício foi criado. Os espaços abaixo documentam os materiais previstos no projeto.</p>
          </div>
          <div className="mockup-grid">
            {pendingGroups.map((item, index) => (
              <article className={`mockup-placeholder mockup-${index + 1}`} key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <em>Arquivo ainda não disponível</em>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-dark downloads-section" id="downloads">
          <div className="section-index">09 / Downloads</div>
          <div className="downloads-heading">
            <h2>Arquivos oficiais,<br />prontos para uso.</h2>
            <p>8 arquivos SVG disponíveis. Outros formatos permanecem sinalizados como pendentes.</p>
          </div>
          <div className="download-table">
            {brandAssets.map((asset) => (
              <a href={asset.path} download key={asset.id} className="download-row">
                <span>{asset.name}</span>
                <span>{asset.kind}</span>
                <span>{asset.format}</span>
                <strong>Baixar ↓</strong>
              </a>
            ))}
          </div>
          <div className="unavailable-downloads">
            {["PNG", "PDF", "EPS", "Editáveis", "Templates sociais", "Pacote de vídeo"].map((item) => (
              <div key={item}><span>{item}</span><em>Em preparação</em></div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <div>
          <img src="/assets/brand/symbols/simbolo branco.svg" alt="" />
          <span>Enquanto Vivo · Central de Marca</span>
        </div>
        <a href="#topo">Voltar ao topo ↑</a>
      </footer>

      {scrolled && (
        <a className="back-to-top" href="#topo" aria-label="Voltar ao topo">↑</a>
      )}

      {lightboxAsset && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Visualização ampliada de ${lightboxAsset.name}`}>
          <button className="lightbox-backdrop" type="button" aria-label="Fechar visualização" onClick={() => setLightboxAsset(null)} />
          <div className={`lightbox-content ${lightboxAsset.theme}`}>
            <button ref={closeButtonRef} className="lightbox-close" type="button" onClick={() => setLightboxAsset(null)}>
              Fechar ×
            </button>
            <AssetPreview asset={lightboxAsset} />
            <div>
              <span>{lightboxAsset.name} · {lightboxAsset.format}</span>
              <a href={lightboxAsset.path} download>Baixar arquivo ↓</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
