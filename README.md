# Enquanto Vivo — Central de Marca

Brand book digital responsivo do canal Enquanto Vivo. A interface apresenta somente os arquivos oficiais disponíveis e identifica de forma explícita todo material ainda pendente.

## Executar

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

Para gerar a versão estática usada pelo GitHub Pages:

```bash
npm run build:pages
```

O workflow `.github/workflows/deploy-pages.yml` publica automaticamente o site no GitHub Pages após cada envio para a branch `main`.

## Organização dos materiais

- Logos e avatares: `public/assets/brand/logos/`
- Símbolos: `public/assets/brand/symbols/`
- Mockups: `public/assets/brand/mockups/`
- Vídeos e animações: `public/assets/brand/video/`
- Templates: `public/assets/brand/templates/`
- Arquivos adicionais: `public/assets/brand/downloads/`
- Fotografias: `public/assets/images/photography/`
- Imagem de abertura: `public/assets/images/hero/`

Os arquivos disponíveis são cadastrados em `app/brand-data.ts`. Textos, estrutura das seções e interações estão em `app/page.tsx`; cores e estilos funcionais da interface estão centralizados em `app/globals.css`.

## Como atualizar

1. Adicione o arquivo original na pasta correspondente sem alterar sua qualidade.
2. Cadastre nome, formato, caminho e tema de visualização em `app/brand-data.ts`.
3. Para cores oficiais adicionais, atualize a lista da seção de cores em `app/page.tsx` somente com os valores aprovados.
4. Para fontes, adicione os arquivos licenciados e declare os pesos aprovados em `app/globals.css`.
5. Substitua os placeholders apenas quando os materiais oficiais estiverem disponíveis.

## Materiais pendentes

- Fotografia de abertura e direção fotográfica
- Manual técnico com área de proteção e tamanho mínimo
- Valores CMYK e Pantone
- Arquivos licenciados da tipografia oficial
- Banner, thumbnails, abertura, encerramento e watermark do YouTube
- Templates de Stories, Reels e Shorts
- Sistema de legendas
- Vinheta e logo animado
- Cinco mockups de camisetas
- Galeria final de mockups
- Versões PNG, PDF, EPS e editáveis

Nenhum desses materiais é simulado como peça oficial. A interface mantém áreas preparadas e identificadas como “Em preparação”.
