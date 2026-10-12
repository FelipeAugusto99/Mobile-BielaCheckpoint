# Biela — peças de bike, direto no celular

App de loja (React Native + Expo SDK 57 + TypeScript + Reanimated 4) do **Checkpoint 5**, evoluído a
partir do app do CP anterior. Consome a API da turma (`https://api.mockmerce.com.br/v1`):
catálogo, conta do comprador, favoritos, sacola, pedido e pagamento, e agora também **avaliações com
foto**, **pontos de retirada no mapa por distância**, **avisos com deep link** e **movimento com
propósito**.


## Integrante

| Integrante | RM |
| --- | --- |
| Felipe Augusto Lopes Ferreira | 563982 |

## Mapa de autoria

| Integrante | Responsabilidade | Arquivos principais |
| --- | --- | --- |
| Felipe Augusto | Base: API, sessão, cache por usuário | `src/services/http.ts`, `src/services/session.ts`, `src/query/AppQueryProvider.tsx`, `src/auth/AuthProvider.tsx` |
| Felipe Augusto | Catálogo, favoritos, sacola, pedido | `app/(tabs)/*`, `app/product/[id].tsx`, `app/order/[id].tsx`, `src/hooks/use{Catalog,Favorites,Cart,Orders}.ts` |
| Felipe Augusto | Avaliações com foto | `src/components/ReviewsSection.tsx`, `src/services/reviewService.ts`, `src/hooks/useReviews.ts` |
| Felipe Augusto | Localização, retirada e mapa | `app/pickup.tsx`, `src/hooks/useUserLocation.ts`, `src/components/PickupMap.tsx`, `src/services/pickupService.ts`, `src/checkout/PickupSelection.tsx` |
| Felipe Augusto | Notificações (Caminho B) | `src/notifications/*`, `src/services/pushService.ts`, `src/components/NotificationCard.tsx` |
| Felipe Augusto | Movimento | `src/motion/*` |

## Como rodar

Requisitos: Node 20+ e o app **Expo Go** (SDK 57, a versão atual da loja de apps) no celular, ou um
emulador. Não precisa de development build: o app usa o **Caminho B** de notificações.

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

Preencha o `.env` (ele **não** é versionado):

| Variável | O que colocar |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | já vem preenchida: `https://api.mockmerce.com.br/v1` |
| `EXPO_PUBLIC_API_KEY` | a API key da loja |
| `EXPO_PUBLIC_STUDENT_RM` | o RM do aluno (563982) |

```bash
npx expo start -c         # escaneie o QR code com o Expo Go
npm run typecheck         # tsc --noEmit
```

Depois de mudar o `.env`, reinicie sempre com `npx expo start -c`: o Expo só lê as variáveis ao montar o
bundle.

Pacotes novos entram sempre por `npx expo install`. Não existe `babel.config.js`: o plugin do worklets
já vem no `babel-preset-expo`, e adicionar `react-native-reanimated/plugin` manualmente quebra o projeto.

### O que cadastrar na API antes de testar

O painel do aluno estava fora do ar (domínio sem resposta), então a loja foi montada pelo Swagger da
API, com a API key da loja:

| Endpoint | Para quê |
| --- | --- |
| `POST /store/groups` | cria a loja e devolve a API key |
| `POST /pickup-points` | 3 ou mais pontos de retirada, **espalhados** (sem distâncias diferentes não há ordenação a demonstrar) |
| configuração da loja | origem do mapa (o marcador verde da loja) |
| `POST /categories` e `POST /products` | produtos compráveis, com `state: PUBLISHED`, preço e estoque |

Os dados ficam salvos na API: não é preciso recadastrar a cada teste.

Para testar a avaliação: comprar o produto, pagar o pedido (pagamento simulado) e voltar à tela da peça.
Para testar o aviso: no Swagger, `POST /push/test` com `{ "produtoId": "<id de um produto>" }`, minimizar
o app e voltar para ele.

## Acesso à loja e credenciais de teste

- API key da loja: entregue ao professor em canal privado do Teams
- Comprador de teste: `teste@biela.com` · senha `teste123`

## Notificações: Caminho B (notificação local)

**Escolhemos o Caminho B.** Motivos: roda no Expo Go, sem development build, sem conta paga da Apple e
sem credencial do Firebase; qualquer pessoa consegue demonstrar no próprio aparelho. Não pedimos o bônus
do push real.

Como funciona (`src/notifications/`):

1. `setup.ts` define como a notificação aparece com o app aberto e **cria o canal do Android**
   (`biela-avisos`) antes de qualquer pedido de permissão (exigência do Android 13+).
2. A permissão **não é pedida na abertura**. O app só oferece os avisos (a) depois que a pessoa
   favorita uma peça, na tela do produto, e (b) no card "Avisos de preço" da aba Conta. O prompt do
   sistema aparece só quando ela toca em "Ativar avisos" e já entende o que ganha.
3. Com a permissão concedida, `NotificationSync` busca `GET /push/messages` **ao abrir o app e ao
   voltar para ele**, e `sync.ts` apresenta cada mensagem como notificação local, com o payload inteiro:
   `title` e `body` para a pessoa, `data` para o app. Cada mensagem aparece uma vez por comprador (ids
   vistos ficam no AsyncStorage). Na primeira execução apresentamos só as 3 mais recentes, para não
   despejar o histórico. `FAILED` é ignorada; `SKIPPED` (ex.: `NO_DEVICE`) conta como "funcionou, não
   havia aparelho", e é justamente o caso do Caminho B: o `POST /push/test` da loja responde
   `sent: 0, skipped: 1` porque não há aparelho cadastrado no servidor.
4. **Deep link:** `NotificationRouter` usa `useLastNotificationResponse`, que cobre o toque com o app
   aberto, em segundo plano **e** o toque que abriu o app fechado. Lê `data.produtoId` e abre
   `/product/[id]`.
5. **Permissão negada:** o app continua inteiro. O card explica o estado, como reativar nos ajustes
   do aparelho e oferece "Abrir ajustes" (ou "Tentar ativar de novo" quando o sistema ainda deixa
   perguntar). Ao voltar dos ajustes o estado se atualiza sozinho.

Limitação honesta do Caminho B: o aviso só aparece quando o app é aberto, não no instante em que o
aviso é enviado.

## Permissões e degradação

| Permissão | Se negada | Onde |
| --- | --- | --- |
| Galeria | O formulário de avaliação continua com nota e comentário; a tela explica o que se perde (a foto) e oferece "Abrir ajustes" quando o sistema não pergunta mais | `ReviewsSection.tsx` |
| Localização | A lista de pontos aparece **sem ordenar**, com explicação e botão "Tentar de novo"/"Abrir ajustes". Três desfechos: concedida, negada, concedida sem posição (GPS desligado ou sem sinal, com timeout de 10 s para nunca ficar travada em "obtendo localização") | `useUserLocation.ts`, `app/pickup.tsx` |
| Notificação | App inteiro; perfil explica e ensina a reativar | `NotificationCard.tsx` |
| Reduzir movimento | Troca deslocamento/escala por fade; o feedback continua | `src/motion/` |

No iOS, depois da primeira resposta o sistema não pergunta de novo; por isso o app orienta a pessoa a
ir aos ajustes do aparelho.

## Decisões técnicas

Cite o commit real de cada decisão (`git log --oneline`).

1. **Uma instância de Axios com interceptors** (`src/services/http.ts`) — headers fixos, Bearer
   injetado/removido a cada request, erros normalizados em `AppError`. Commit: `PREENCHER` ("feat: camada de API…").
2. **Token no `expo-secure-store`** (`src/services/session.ts`). Commit: `PREENCHER` ("feat: camada de API…").
3. **401 derruba a sessão só nas rotas de comprador** — o catálogo responde 200 mesmo com token
   adulterado, então a validação é `GET /auth/me`. Commit: `PREENCHER` ("feat: camada de API…").
4. **Um `QueryClient` e uma chave de cache por comprador** (`src/query/AppQueryProvider.tsx`) — a lista
   de favoritos do usuário anterior nunca vaza. Commit: `PREENCHER` ("feat: autenticação e cache…").
5. **Sem atualização otimista em carrinho e pedido**: dinheiro e estoque não se adivinham. Commit:
   `PREENCHER` ("feat: vitrine, favoritos, sacola e pedidos").
6. **A média da avaliação vem do produto** (`ratingOf` em `src/utils/format.ts`, campo `rating` com
   `average` e `count`). A lista de avaliações é só a lista; **nada é calculado no app**. Commit:
   `PREENCHER` ("feat: avaliações com foto…").
7. **`can-review` antes do formulário** (`useCanReview`): cada motivo devolvido pela API ganha um texto
   próprio (pedido não pago, já avaliou, não comprou, genérico). Commit: `PREENCHER` ("feat: avaliações com foto…").
8. **Upload multipart sem `Content-Type` fixo** (`uploadPhoto` em `reviewService.ts`): o React Native
   gera o boundary. A avaliação referencia o **`mediaId`**, não a URL. Commit: `PREENCHER` ("feat: avaliações com foto…").
9. **Depois de avaliar, invalidamos** `reviews`, `product` e `can-review` (`useCreateReview`): lista e
   média atualizam sem sair da tela. Commit: `PREENCHER` ("feat: avaliações com foto…").
10. **Retirada:** a API só ordena se receber `latitude` e `longitude`; sem posição a ordem é a de
    cadastro (esperado, não é bug). A escolha vive em `PickupSelectionProvider` e vai em
    `POST /orders/checkout` como `pickupPointId`; o pedido criado mostra o ponto. Commit: `PREENCHER`
    ("feat: pontos de retirada…").

## Decisões de produto

**Biela** é uma loja de peças e acessórios de bicicleta para quem pedala no dia a dia e quer resolver a
manutenção sem sair de casa. A identidade (verde floresta + laranja sinaleiro, Space Grotesk, vocabulário
"Vitrine / Sacola / Furou o pneu") continua nas telas novas: avaliações, retirada, avisos e perfil.
Detalhes em `BRAND.md`.

## Movimento: a defesa

Tudo vem de **um arquivo**: `src/motion/tokens.ts` (durações, molas, escalonamento). Nenhum componente
define número de animação por conta própria. A constante **`ANIMATIONS_ENABLED`** nesse arquivo
desliga todas as animações do app de uma vez; com ela em `false` o app continua usável, e cada ação
mantém feedback estático (cor, opacidade, texto).

### Mantidas (e por quê)

| Animação | Requisito | Por que fica |
| --- | --- | --- |
| Mola no toque (`PressableScale`) em botões, cartões, chips, passos de quantidade | RF-49 | Confirma que o toque foi entendido, em 140 ms. Mola curta e firme, sem balançar |
| "Pop" do coração + vibração leve ao favoritar; mensagem "Guardada nos favoritos" | RF-50 | Favoritar não navega: sem isso a pessoa não sabe se funcionou |
| Entrada escalonada da lista de peças | RF-51 | Orienta o olhar de cima para baixo. O atraso por item é **limitado** (`stagger.maxDelay` = 330 ms), então o 20º item não espera 1 s |
| Saída animada + acomodação dos itens que ficam (sacola e favoritos) | RF-52 | Mostra **o que** saiu e para onde o resto foi; sem isso a lista "pula" e a pessoa se perde |
| Skeleton pulsando na vitrine | RF-53 | Dá sinal de vida e já mostra o formato do conteúdo, em vez de um texto parado |
| Fade nas avaliações e nos pontos de retirada | RF-51 | Reaproveita o mesmo critério da lista de peças |

### Cortadas (e por quê)

- Paralaxe/zoom na foto do produto e transição compartilhada entre cartão e detalhe: decoração, não
  informação, e custo alto em aparelho fraco.
- Animação de contagem do total da sacola: o valor precisa ser lido na hora, e dinheiro não deve
  "rolar".
- Animação ao trocar de aba: o sistema já faz a sua.

### "Reduzir movimento" do sistema (RF-54)

`useMotionMode()` devolve `full`, `reduced` ou `off`. Em `reduced`, **deslocamento e escala saem**
(entrada vira fade, o toque só escurece, o "pop" do coração some, a lista não se reacomoda com mola, o
mapa não "voa") e **o feedback fica**: o fade de opacidade, a troca de cor do coração, a vibração, a
mensagem de confirmação e o skeleton (só opacidade, sem deslocamento). Por padrão o Reanimated pularia a
animação inteira nesse modo e o item surgiria sem sinal nenhum; por isso os fades do modo reduzido
usam `ReduceMotion.Never`, de propósito.

## Uso de IA

- **Ferramenta:** Claude (Anthropic).
- **Quais partes:** estrutura do projeto, camada de API, sessão, cache por usuário, telas, hooks, e as
  quatro novidades do CP5 (avaliações, retirada/mapa, notificações, movimento).
- **O que mudamos depois de gerar:** atualizamos o projeto do Expo SDK 54 para o 57 (o Expo Go do
  iPhone só abre o SDK atual) e corrigimos o que isso quebrou (configuração da splash no `app.json`,
  `baseUrl` do `tsconfig.json` no TypeScript 6, tipo da cor do `tabBarIcon`); corrigimos o rótulo das
  versões do produto (`variantLabel`), que mostrava `[object Object]` com o formato real da API; criamos
  a loja, as categorias, os produtos e os pontos de retirada na API; e rodamos o roteiro completo de testes
  em um iPhone com Expo Go, incluindo a negação de cada permissão.

## Diário de erro

### Felipe Augusto — 12/10 às 03:11
1. **O que apareceu:** na tela do produto, os botões de escolha da versão do Pneu Aro 29 mostravam
   `[object Object]` no lugar de `2.1` e `2.3` (o preço trocava certo ao tocar).
2. **Como investigou:** o preço trocava, então a seleção funcionava; só o rótulo estava errado. O rótulo
   vem de `variantLabel`, que juntava `Object.values(variant.options)` com `join`.
3. **Causa:** o app esperava `options` como `{ "Largura": "2.1" }`, mas o detalhe do produto devolve cada
   opção como objeto, e `join` de objetos vira `[object Object]`.
4. **O que mudou (commit):** `variantLabel` passou a ler a opção como texto ou como objeto (`value`,
   `label`, `name`) e o tipo `options` virou `unknown`. Commit: `PREENCHER`.

## Limitações conhecidas

- **Testado em aparelho:** o roteiro foi rodado em um **iPhone com Expo Go (SDK 57)**: cadastro, vitrine,
  favoritos, sacola, retirada com e sem localização, pedido e pagamento (inclusive recusa simulada),
  avaliação com foto, notificação com deep link, negação de localização/fotos/notificações e "reduzir
  movimento". **Não foi testado em Android.**
- Os formatos de resposta de **avaliações, `can-review`, `/push/messages` e `/store/settings`** não estão
  detalhados no Swagger. O app os lê de forma tolerante (`reviewService.ts`, `pushService.ts`,
  `pickupService.ts`, `ratingOf`). Se algum campo vier com outro nome em outra loja, o ajuste é só nesses
  arquivos. O `rating` do produto (`average` e `count`) e a lista de pontos de retirada
  (`coordinate`, `address`, `distanceKm`) foram conferidos na loja real.
- O texto de cada motivo do `can-review` casa por palavras-chave (`explainCannotReview` em
  `ReviewsSection.tsx`); se a API usar outros códigos, cai no texto genérico com a `message` da própria API.
- Caminho B: o aviso só chega ao abrir o app (ver seção de notificações). Sem push real, sem bônus.
- Mapa: no Expo Go funciona; em development build/produção para Android é preciso configurar uma
  chave do Google Maps (`android.config.googleMaps.apiKey`) **fora do Git**.