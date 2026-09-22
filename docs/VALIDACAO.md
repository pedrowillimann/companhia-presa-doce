# Validação — 21/09/2026

## Executado com sucesso

- `npm test`: 8 testes (níveis, atributos, validação, direitos de edição, escaping e preservação dos cinco originais por SHA-256).
- `npm run check`: sintaxe dos módulos JavaScript, estrutura de arquivos e ausência de scripts nas seções importadas.
- `npm run test:ui`: 5 testes de DOM em memória (inicial, busca, cinco fichas, checklist, bloqueio de visitante e administração).
- `npm run test:rules`: 10 testes no emulador Firestore real, incluindo importação atômica das cinco fichas e consultas usadas pela aplicação.

Total: 23 testes aprovados. Erros PERMISSION_DENIED nos logs do emulador são esperados nos casos que tentam acesso proibido.

## Conteúdo recuperado

| Personagem | Fonte | Skills / passivas | Marcos |
|---|---|---:|---:|
| M'Raaj Presa-Doce | MRaaj_Presa_Doce_Templar_Tracker.html | 13 | 4 |
| Dar'Zak | DarZak_Nightblade_Assassino_PvP_Tracker.html | 13 | 4 |
| Kra'zir | Krazir_Warden_Arqueiro_Healer_PvE_Tracker.html | 12 | 5 |
| Bro'Schita | BroSchita_Dragonknight_Tank_PvE_Tracker.html | 14 | 6 |
| Nefasto | Nefasto_Nightblade_Vampiro_Assassino_Tracker.html | 19 | 7 |

97 objetivos extraídos. Originais preservados byte a byte. As orientações originalmente montadas por JavaScript foram incorporadas como texto estático; scripts locais e controles antigos não são executados. Diferenças de escolhas entre Nightblades foram mantidas (por exemplo Siphoning Attacks e Leeching Strikes). Nenhum dado real de progresso foi inferido.

## Ainda pendente

- Verificação visual em navegador desktop/celular: navegador remoto bloqueou a abertura do servidor local; testes DOM não substituem inspeção visual.
- Criar repositório GitHub, ativar Pages e verificar deploy.
- Criar/configurar projeto Firebase real, habilitar Authentication e Firestore, publicar regras e preencher configuração Web.
- Promover conta principal por UID no console e vincular jogadores reais.
- Teste completo com contas reais, incluindo cadastro, recuperação de senha e persistência em segundo dispositivo.

## Acessos verificados

Conta GitHub `pedrowillimann` conectada por integração, mas a capacidade exposta não cria repositórios nem configura Pages. O navegador abriu criação de repositório e exigiu login separado.

O console Firebase retornou HTTP 502 / conexão recusada em duas tentativas. Não há evidência de projeto criado, serviço habilitado ou dados enviados ao Firebase de produção.

Nenhum domínio público foi publicado nesta etapa. `public/js/config.js` permanece `null`; a interface comunica prévia somente para leitura.
