# Fluxo

Organizador de tarefas em quadro Kanban, com anexos de arquivos, feito para o Abraão: estagiário de TI, estudante à noite, sempre com o celular numa mão só. Protótipo funcional desenvolvido para a disciplina de Interação Humano-Computador (IHC).

> Todos os dados ficam **só no seu dispositivo** (IndexedDB, via Dexie). Não existe backend nem chamadas externas.

## Identidade visual

O visual é **editorial e acolhedor**, pensado pra fugir da estética genérica de "app gerado por IA" (fundo branco/cinza-azulado, tudo em Inter, cartões arredondados com sombra suave iguais em qualquer lugar):

- **Fundo cor de papel** (`#FBF6EE` no claro, marrom quente `#1C1611` no escuro) em vez de branco/cinza frio.
- **Fraunces** (serifada) nos títulos e saudações, combinada com **Inter** no corpo do texto — hierarquia mais editorial sem perder a legibilidade no dia a dia.
- **Marca própria**: as três barras do logo agora têm gradiente azul → terracota, simbolizando o "fluxo" de uma tarefa até a conclusão.
- **Cartões de tarefa com lombada colorida** (borda esquerda na cor da etiqueta) — reforça a categoria de relance, sem depender só da tag de texto.
- **Filetes terracota** (`--rule`) como divisor decorativo sob títulos de seção — um recurso tipográfico, nunca usado em botões, pra manter o laranja do CTA "Nova tarefa" exclusivo.

Os tokens de cor funcional (primário, sucesso, aviso, perigo) e os contrastes WCAG AA documentados abaixo foram mantidos; o que mudou foi a paleta neutra (fundo/superfície/texto) e a tipografia de destaque.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço indicado no terminal (normalmente `http://localhost:5173`).

Para gerar a build de produção:

```bash
npm run build
npm run preview
```

## Como começar

Não existe mais conta nem dados de exemplo pré-carregados. Na primeira vez que alguém abre o app:

1. Toque em **Criar conta** e cadastre nome, e-mail e senha.
2. O quadro nasce com as 3 colunas padrão (A fazer, Fazendo, Concluído) — sem tarefas, sem etiquetas.
3. Dali em diante é só usar: criar tarefas, etiquetas e anexos é tudo manual, do jeito que fica no seu dispositivo de verdade.

⚠️ **Aviso de segurança:** a autenticação é local e feita só para fins do protótipo — a senha é armazenada como hash SHA-256 com salt (WebCrypto), nunca em texto puro, mas isso **não substitui** um sistema de autenticação real de produção. A troca para autenticação de verdade está planejada na seção [Próximos passos: Supabase](#próximos-passos-supabase-opcional-ainda-desligado).

## Capturas de tela

Para gerar as capturas usadas no relatório (`docs/screenshots/`):

```bash
npx playwright install chromium
npx playwright test
```

As imagens são salvas em `docs/screenshots/`: telas 1 a 6 em viewport de celular (390×844) e o Quadro também em desktop (1440×900).

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS (tokens de design via `src/styles/tokens.css`)
- `react-router-dom`
- `@dnd-kit/core` + `@dnd-kit/sortable` (arrastar e soltar, com suporte a teclado)
- `dexie` + `dexie-react-hooks` (IndexedDB, tarefas e arquivos)
- `lucide-react` (ícones)

## Estrutura

```
src/
  components/   Botões, cartões, modal, toast, formulários — peças reutilizáveis
  features/     auth, home, board, task, files, settings
  db/           Schema do Dexie, autenticação local
  hooks/
  lib/          Utilitários de data
  styles/       tokens.css — cores, tipografia, espaçamento
  routes.tsx
```

## Decisão de design → Princípio de IHC

| Decisão de design | Princípio de IHC |
|---|---|
| Cada coluna do quadro tem fundo próprio (`--column`) | Gestalt — Região comum |
| Metadados do cartão (etiqueta, prazo, prioridade) agrupados, com espaço maior entre cartões | Gestalt — Proximidade |
| A mesma disciplina/etiqueta sempre usa a mesma cor | Gestalt — Similaridade |
| Animação ao mover cartão mostra a coluna de destino | Gestalt — Destino comum |
| Poucos elementos por tela, hierarquia clara | Gestalt — Pregnância |
| Botão "Nova tarefa" (FAB de 56px) no canto inferior direito | Lei de Fitts |
| Navegação fica embaixo no celular, ao alcance do polegar | Lei de Fitts |
| Navegação com só 4 itens (Início, Quadro, Arquivos, Ajustes) | Lei de Hick-Hyman |
| Quadro começa com 3 colunas; menus curtos | Lei de Hick-Hyman |
| Alça de arrasto visível (`GripVertical`) e botões sempre com nome | Teoria da Ação — Execução |
| Toast de feedback ("Tarefa movida para Fazendo · Desfazer") a cada ação | Teoria da Ação — Avaliação |
| Barra de progresso durante o envio de anexos | Teoria da Ação — Avaliação |
| Estados vazios explicativos ("Seu quadro está livre por enquanto…") | Engenharia Semiótica — signo metalinguístico |
| Ícones nunca repetidos para ações diferentes | Engenharia Semiótica — signo estático |
| Arrastar cartão OU usar o menu "Mover para…" | Ação situada — dois caminhos possíveis |
| Confirmação antes de excluir, com "Desfazer" por 6s no toast | Segurança no uso |
| Indicador "Salvo ✓" com salvamento automático | Segurança no uso |
| Validação de tipo e tamanho de arquivo, com mensagem de erro clara | Segurança no uso |
| Rótulos fixos acima dos campos (nunca só placeholder) | Formulários — clareza |
| Erros de formulário com ícone + texto explicando como corrigir | Formulários — clareza |
| Contraste mínimo 4,5:1 em todos os temas; nenhuma informação passada só por cor | Acessibilidade (WCAG 2.2 AA) |
| Cartão de tarefa com lombada colorida (borda da cor da etiqueta) | Gestalt — Similaridade, reforçada por um segundo canal visual |
| Filete terracota decorativo, nunca usado em botões | Engenharia Semiótica — mantém o laranja como signo exclusivo do CTA |

## Checklist de acessibilidade

- [x] Contraste AA em todos os temas (claro, escuro, alto contraste)
- [x] Todo o app é navegável só pelo teclado, com ordem de foco lógica e foco visível
- [x] O Kanban é operável pelo teclado (`KeyboardSensor` do `@dnd-kit`)
- [x] Anúncios de mover tarefa usam `aria-live` (região oculta no Quadro) e o toast usa `aria-live="polite"`
- [x] Ícones decorativos têm `aria-hidden`; ícones funcionais têm `aria-label`
- [x] Modais prendem o foco, fecham com Esc e devolvem o foco ao elemento de origem
- [x] Nenhuma informação é passada só por cor (prazo e prioridade sempre têm ícone + texto)
- [x] Layout responsivo funciona com fonte a 150% (ajuste em Ajustes → Leitura) e zoom do navegador
- [x] `prefers-reduced-motion` é respeitado, além da opção manual "Reduzir animações"

## Segurança

- Senha guardada apenas como hash com salt (WebCrypto `SubtleCrypto.digest`), nunca em texto puro.
- Upload de arquivos validado por tipo MIME **e** extensão, com limite de 10 MB.
- Nomes de arquivo sanitizados antes de salvar.
- Nenhum conteúdo é renderizado com `dangerouslySetInnerHTML`.
- Nenhuma chamada de rede a serviços externos — os dados ficam só neste dispositivo (ver Ajustes → Dados).

## Próximos passos: Supabase (opcional, ainda desligado)

O código já tem o terreno preparado pra evoluir de protótipo local para um app real sincronizado entre dispositivos, **sem alterar o comportamento atual**:

- `@supabase/supabase-js` instalado e `src/lib/supabaseClient.ts` criado, mas inerte — só é ativado se as variáveis de ambiente existirem.
- `.env.example` mostra as duas variáveis necessárias (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

**Para ativar, quando quiser escalar:**

1. Crie uma conta grátis em [supabase.com](https://supabase.com) e um novo projeto.
2. Em *Project Settings → API*, copie a **Project URL** e a chave **anon public**.
3. Copie `.env.example` para `.env.local` e cole os dois valores.
4. Me avise com essas duas informações em mãos — a partir daí eu crio as tabelas (com Row Level Security), troco a autenticação local pelo Supabase Auth e migro tarefas/anexos aos poucos, mantendo o app funcionando o tempo todo.

Até lá, o Fluxo continua 100% local, como pede o protótipo da disciplina.
