# Companhia Presa-Doce

Aplicação estática em português para a guilda ESO-GUILD, com Firebase Authentication e Cloud Firestore. Hospedagem em GitHub Pages. Sem etapa de build, framework ou backend próprio.

## Estado desta entrega

Interface e integração implementadas. Até preencher `public/js/config.js`, o site funciona **somente como prévia de leitura** das cinco fichas originais. Não simula login nem afirma que progresso foi salvo. Publicação e testes de produção dependem do projeto Firebase e do repositório GitHub configurados. Consulte `docs/VALIDACAO.md` para evidência dos testes executados.

## Executar

Node 22 ou superior. `npm run dev` abre servidor em http://localhost:4173. `npm test` executa testes sem instalar dependências; `npm run check` verifica sintaxe e estrutura. Para testar regras, `npm install`, Java 21 recomendado e `npm run test:rules` (baixa/inicia emulador Firestore; nenhuma credencial de produção).

## Estrutura

- `public/index.html`: estrutura, navegação e login.
- `public/css/styles.css`: tema responsivo de pergaminho, vinho e dourado.
- `public/assets/sigil.svg`: símbolo original vetorial, sem assets ESO.
- `public/js/app.js`: rotas por hash, membros, fichas, progresso e administração.
- `public/js/store.js`: leituras em tempo real, autenticação, transações e administração.
- `public/js/firebase.js`: carregamento do SDK Firebase 12.3.0 por CDN oficial.
- `public/js/config.js`: configuração **pública** da aplicação Firebase Web.
- `public/js/domain.js`: validação e cálculos.
- `public/data/seed.json`: builds extraídas das fontes, sem progresso inventado.
- `originals/`: cinco HTML originais intactos, fora da pasta publicada.
- `scripts/import-builds.py`: importador conservador (Python + beautifulsoup4 + Node).
- `firestore.rules`: autorização e validação no servidor.
- `tests/`: domínio, preservação das fontes e regras reais no emulador.
- `.github/workflows/pages.yml`: testes e deploy apenas da pasta `public`.

## Firebase: configuração inicial

1. Criar/selecionar projeto Firebase. Não é necessário habilitar faturamento para esta V1 dentro das cotas gratuitas.
2. Registrar aplicativo Web; copiar o objeto público `firebaseConfig` para `public/js/config.js`, substituindo `null`.
3. Authentication → Sign-in method: habilitar Email/Password. Em Settings → Authorized domains, adicionar o domínio GitHub Pages (somente hostname, sem caminho). Para desenvolvimento, adicionar localhost explicitamente, se necessário.
4. Criar Firestore `(default)` em modo de produção. Escolher a região conscientemente; ela não pode ser alterada no mesmo banco. Não utilizar regras de teste abertas.
5. Publicar `firestore.rules` no console ou usar Firebase CLI: `npx firebase login` e `npx firebase deploy --only firestore:rules,firestore:indexes --project SEU_PROJECT_ID`.
6. No site, criar sua conta. Na primeira autenticação, `users/UID` é criado com papel `player`.
7. **Bootstrap administrativo**: no console Firestore, alterar apenas o campo `role` do SEU documento `users/UID` para `admin`. Confirmar o UID em Authentication. Nunca promover por e-mail hardcoded, senha compartilhada ou botão público. O cliente não pode promover a si próprio.
8. Abrir Administração → Importar fichas originais. A importação é transacional e cria somente documentos ausentes.

Credenciais de serviço/Admin SDK, tokens e chaves privadas nunca vão para o front-end ou repositório. O objeto público Web SDK não concede permissão administrativa. Segurança está nas regras.

## Modelo de dados

| Coleção | Documento | Conteúdo | Leitura | Escrita |
|---|---|---|---|---|
| users | UID | displayName, role, createdAt | próprio usuário / admin | próprio nome; admin gerencia papel de outros |
| characters | slug | nome, raça, classe, função, armas, buildId, public, archived | público na V1 | admin |
| builds | slug-vN | versão, fonte/hash, atributo, seções, skills, goals, checklistIds | público na V1 | admin cria; versão existente imutável |
| assignments | slug | ownerUid | proprietário / admin | admin |
| progress | slug | level, attributes, completed, notes, buildId, revision, updatedAt, updatedBy, public | público na V1 | proprietário / admin |

A V1 publica todas as fichas e seu progresso. E-mails não são gravados nos documentos públicos. Notas de progresso são públicas; a interface avisa. UIDs de autores de atualização constam nos registros de progresso, mas não são credenciais. Dados de vínculo ficam separados e privados. Arquivar retira da listagem, **não torna a ficha privada**. A V1 não oferece ficha secreta; não adicione dados pessoais às builds.

Nível inicialmente desconhecido: não há documento de progresso até o primeiro registro. O formulário sugere 1, mas não o publica automaticamente. Barra calculada por `(nível - 1) / 49` (1 = 0%, 50 = 100%). Atributos reais separados do atributo planejado. Checklists indicam realização do objetivo completo original, inclusive habilidade → morph quando agrupados na fonte. Não são inferidos pelo nível.

Regras negam edição por visitante, alterações alheias, autopromoção, tomada de vínculo, campos extras no progresso, níveis fora de 1–50, IDs de checklist fora da build, duplicatas, mais de 64 atributos e notas acima de 2.000 caracteres. Timestamp e autor validados no servidor. Revisão monotônica e transação detectam alterações concorrentes.

## Membros e vínculos

Jogador cria a própria conta e informa o UID exibido em Minha conta. O administrador escolhe personagem e conta em Administração → Vincular jogador. Uma conta pode ter mais de um personagem; cada personagem possui um proprietário na V1. Uma conta sem vínculo pode consultar tudo, mas não editar. Admin pode editar qualquer progresso abrindo a ficha.

O painel gerencia papéis do site. Excluir/desativar contas de Authentication requer console Firebase/Admin SDK confiável; não é feito no navegador. Não desative o único administrador. O painel impede que admin rebaixe a si mesmo; o console continua sendo a rota de recuperação.

## Novos personagens e builds

Crie uma nova build no painel em JSON, usando uma entrada de `public/data/seed.json` como esquema, com `id`, `characterId`, `version`, `attribute`, `sections`, `skills`, `goals`, `pending` e dados de origem. Cada item de skill/goal precisa de `id` único e estável, `name`, `line` e `why`. As seções usam `{title, html}` com HTML sem scripts (sanitização por lista de tags no cliente). O painel deriva `checklistIds`. Em seguida cadastre personagem com o mesmo `characterId` e seu `buildId`.

Para corrigir uma build, primeiro confirme as mudanças com seu responsável. Crie outro ID/versionamento; depois altere o buildId no editor do personagem. **Não edite as versões originais**. Preserve IDs de objetivos que continuam iguais. O documento de progresso antigo fica intacto até o próximo salvamento; nesse salvamento, apenas objetivos válidos na nova versão são mantidos. Não há histórico completo de revisões de progresso na V1: exporte os documentos no console antes de migrações que removam objetivos. Builds antigas permanecem disponíveis no banco.

Mundus, comida, sets definitivos e Champion Points não especificados estão marcados como pendentes. Não foram preenchidos com recomendações novas. Fontes originais têm controles locais antigos; eles não são usados no site. Não há importação automática do localStorage dos trackers pessoais.

## GitHub Pages

Criar repositório `companhia-presa-doce` na conta escolhida, enviar este projeto para `main` e em Settings → Pages selecionar Source = GitHub Actions. O workflow executa testes e publica somente `public`. Rotas por hash e caminhos relativos funcionam sob `/companhia-presa-doce/`, sem regra de rewrite/404. O repositório pode ser público, mas não deve conter dados pessoais ou credenciais.

Atualizações de interface: alterar arquivos, rodar `npm test && npm run check`, commit/push em `main`. Conferir Actions e abrir a URL devolvida pelo deploy. Atualizações no Firestore aparecem em tempo real sem republicação. Mudanças nas regras exigem deploy Firebase separado. Regras não são implantadas automaticamente pelo Pages.

## Manutenção e limites

Guardar backup/exportação do Firestore antes de migrações. Monitorar uso e cotas Firebase. Testar visitante, duas contas de jogador distintas e admin após mudanças de permissão. SDK e fontes externas exigem internet; fontes têm fallback local. Sem modo offline de escrita: salvar exige conexão e sucesso do servidor. A V1 não implementa ranking, crafting, eventos ou CP avançado.

Documentação oficial: [Firebase Authentication](https://firebase.google.com/docs/auth), [regras Firestore](https://firebase.google.com/docs/firestore/security/get-started), [GitHub Pages com Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
