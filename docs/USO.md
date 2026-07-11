# Como usar o Duelo

Este guia mostra como usar o app no navegador, no celular e em modo PWA.

## 1. Abrir a arena

Rode o projeto localmente:

```bash
npm install
npm run prisma:generate
npm run dev
```

Abra:

```text
http://localhost:3000
```

A primeira tela já é a arena. Não existe landing page: o usuário entra direto no duelo.

## 2. Votar

1. Veja as duas imagens.
2. Clique ou toque na imagem preferida.
3. A imagem clicada permanece no duelo.
4. A imagem que perdeu é substituída.
5. A sequência aumenta e o Elo é recalculado.

Regra central: a mesma imagem nunca deve aparecer dos dois lados ao mesmo tempo.

## 3. Escolher categoria

Use o seletor **Categoria** para jogar só com um tema, por exemplo:

- Carros
- Gatos
- Aves
- Relógios
- Casas de praia
- Fotos do espaço

Quando uma categoria é escolhida, os duelos passam a usar apenas imagens daquele nicho.

## 4. Jogar com mix de nichos

1. Clique em **Mix**.
2. Marque os nichos desejados na lista.
3. O app passa a sortear duelos apenas entre os nichos selecionados.

Exemplo: carros + árvores + motos.

## 5. Jogar no modo caos

Clique em **Caos** para misturar qualquer nicho disponível.

Neste modo, uma rodada pode trazer carros, outra pode trazer animais, roupas, cidades, natureza ou objetos.

## 6. Trocar formato

Use o controle **Formato**:

- **Em pé**: imagens verticais.
- **Deitada**: imagens horizontais.
- **1:1**: imagens quadradas.

As duas imagens do duelo usam o mesmo formato. O app usa `object-cover` para preencher o card sem distorcer a imagem.

## 7. Usar lado sorteado

Por padrão, a imagem clicada fica do mesmo lado.

Ao marcar **Lado sorteado**, a vencedora continua no duelo, mas pode mudar de lado na próxima rodada.

## 8. Enviar imagem

Na seção **Enviar**, preencha:

1. Título.
2. URL da imagem.
3. Categoria.
4. Formato.

Depois clique em **Enviar para moderação**.

Com PostgreSQL configurado, o envio é salvo como `PENDING`. Sem banco, o envio funciona em memória para demonstração e desaparece ao reiniciar o servidor.

## 9. Instalar como PWA

No Android ou Chrome desktop:

1. Abra o app.
2. Use o menu do navegador.
3. Escolha **Instalar app** ou **Adicionar à tela inicial**.

O projeto inclui:

- `manifest.webmanifest`
- ícones maskable
- `sw.js`
- tela `offline.html`

A arena ainda precisa de internet para buscar novas imagens e registrar votos, mas o app tem shell PWA e fallback offline.

## 10. Rodar verificações

```bash
npm run lint
npm run test
npx tsc --noEmit
npm run build
```

Os testes cobrem:

- dados demo e categorias exigidas;
- orientação das imagens;
- regra de vencedor permanecer no lado correto;
- proibição de imagens duplicadas no mesmo duelo;
- cálculo Elo;
- validação de upload;
- PWA básico;
- API de voto rejeitando JSON inválido e IDs duplicados.
