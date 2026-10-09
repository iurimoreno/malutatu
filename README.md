# malutatu.com.br

Site da campanha de arrecadação para levar o longa de animação **Malu Tatu** (Caolha Filmes) aos cinemas: primeiro Goiânia (meta R$ 100 mil), depois o Brasil (meta R$ 500 mil).

Site estático (HTML, CSS e JS puros), publicado pelo GitHub Pages. Não precisa de build.

## Atualização diária da arrecadação

Edite só o arquivo [`campanha.json`](campanha.json), direto no GitHub (ícone de lápis → *Commit changes*):

```json
{
  "arrecadado": 12350,
  "apoiadores": 87,
  "atualizado_em": "2026-10-12",
  "prazo_creditos": "2026-11-15",
  "formulario_creditos": "https://forms.gle/..."
}
```

| Campo | O que é |
|---|---|
| `arrecadado` | Total recebido, em reais, só números (sem ponto, sem R$). Ex.: `12350` |
| `apoiadores` | Quantidade de pessoas que contribuíram. Use `0` para esconder. |
| `atualizado_em` | Data da atualização, no formato `AAAA-MM-DD`. |
| `prazo_creditos` | Último dia para entrar nos créditos (`AAAA-MM-DD`), ou `null` para esconder. |
| `formulario_creditos` | Link do formulário onde o apoiador informa o nome para os créditos, ou `null`. |

O site atualiza em 1 a 2 minutos depois do commit.

Para testar a barra com outro valor sem mexer no arquivo, abra `https://malutatu.com.br/?demo=150000`.

## Como a barra funciona

É uma barra única: a **primeira metade** vai de R$ 0 a R$ 100 mil (Goiânia, em amarelo) e a **segunda metade** vai de R$ 100 mil a R$ 500 mil (Brasil, em azul, como água correndo). A Malu vai cavando na ponta.

## Pix

- **Pix Copia e Cola:** o botão gera um código Pix (padrão BR Code do Banco Central) já com o valor escolhido. A chave e o nome ficam em `assets/js/main.js`, no objeto `PIX`.
- **QR Code:** `assets/img/pix-qrcode.png` (recortado do `pix.jpeg` do Itaú, sem valor fixo).
- Se a chave mudar, atualize em 4 lugares: `PIX.chave` e a mensagem de compartilhamento em `assets/js/main.js`, o texto da chave em `index.html` e o QR Code.

## Publicação (uma vez só)

1. No repositório do GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
2. Hoje o site está em `https://iurimoreno.github.io/malutatu/`. Para usar o domínio próprio, crie na raiz um arquivo `CNAME` contendo só `malutatu.com.br` e, em **Custom domain**, coloque `malutatu.com.br`.
3. No **registro.br** (faça isso antes ou junto com o passo 2), em *DNS* do domínio, crie:
   - 4 registros **A** para `malutatu.com.br`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 4 registros **AAAA**: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - 1 registro **CNAME** `www` → `iurimoreno.github.io`
4. Quando o DNS propagar (de minutos a algumas horas), marque **Enforce HTTPS** no GitHub Pages.

## Prévia no WhatsApp

A imagem de prévia é `assets/img/og-image.jpg` (1200×630, ~100 KB), configurada nas tags `og:` do `index.html` com endereço absoluto em `https://malutatu.com.br`. Ela **só funciona depois que o domínio estiver no ar com HTTPS**.

Depois de publicar:
1. Teste em <https://developers.facebook.com/tools/debug/> com `https://malutatu.com.br` e clique em *Scrape Again*.
2. Mande o link para você mesmo no WhatsApp. O WhatsApp guarda a prévia em cache: se ela aparecer errada, teste com `https://malutatu.com.br/?v=2`.

## Antes de divulgar (pendências)

- [ ] Confirmar com o Iuri a **divisão do uso do dinheiro** (seção "Para onde vai o seu Pix" no `index.html`; os percentuais atuais são uma sugestão baseada nos custos que ele descreveu).
- [ ] Quando a estreia for confirmada (cinemas, datas, número de salas), atualizar o bloco "Onde estamos hoje" (seção Bastidores) e a pergunta "Quando e onde o filme estreia?" do FAQ.
- [ ] Definir o **prazo para entrar nos créditos** → `prazo_creditos`.
- [ ] Criar o **formulário de nomes para os créditos** (Google Forms: nome como deve aparecer, e-mail/telefone, valor e data do Pix) → `formulario_creditos`.
- [ ] Confirmar o texto do FAQ e da mensagem de WhatsApp com o Iuri.

## Estrutura

```
index.html            página única
campanha.json         dados editáveis (arrecadação, prazo, formulário)
assets/css/style.css  estilos
assets/js/main.js     barra, Pix, copiar/compartilhar, teaser
assets/img/           imagens otimizadas (originais ficam fora do git)
```

Imagens © Caolha Filmes.
