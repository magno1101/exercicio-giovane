const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path'); 

const app = express();


app.use(cookieParser());
app.use(
  session({
    secret: 'minhachave',
    resave: false,
    saveUninitialized: true,
  })
);

const produtos = [
  { id: 1, nome: 'Arroz', preco: 25 },
  { id: 2, nome: 'Feijão', preco: 15 },
  { id: 3, nome: 'Bife', preco: 40 },
];

// Configurar o Express para servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  const lastPage = req.cookies['lastPage'] || '/produtos';
  res.redirect(lastPage);
});

app.get('/produtos', (req, res) => {
  const lastPage = req.cookies['lastPage'] || '/produtos';

  res.send(`
    <html>
    <head>
      <link rel="stylesheet" type="text/css" href="/styles.css">
    </head>
    <body>
      <div class="container">
        <h1>Lista de Produtos</h1>
        <ul>
          ${produtos
            .map(
              (produto) =>
                `<li>${produto.nome} - R$${produto.preco.toFixed(2)} <a href="/adicionar/${produto.id}">Adicionar ao Carrinho</a></li>`
            )
            .join('')}
        </ul>
        <a class="link" href="/carrinho">Ver carrinho</a>
        <a class="link" href="${lastPage}">Voltar para a última página</a>
      </div>
    </body>
    </html>
  `);
});

app.get('/adicionar/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const produto = produtos.find((p) => p.id === id);

  if (produto) {
    if (!req.session.carrinho) {
      req.session.carrinho = [];
    }
    req.session.carrinho.push(produto);
    res.cookie('produtoAdicionado', 'true');

    res.cookie('lastPage', req.headers.referer);
  }
  res.redirect('/produtos');
});

app.get('/carrinho', (req, res) => {
  const carrinho = req.session.carrinho || [];
  const total = carrinho.reduce((acc, produto) => acc + produto.preco, 0);

  res.send(`
    <html>
    <head>
      <link rel="stylesheet" type="text/css" href="/styles.css">
    </head>
    <body>
      <div class="container">
        <h1>Carrinho de Compras</h1>
        <ul>
          ${carrinho
            .map(
              (produto) =>
                `<li>${produto.nome} - R$${produto.preco.toFixed(2)}</li>`
            )
            .join('')}
        </ul>
        <p class="total">Total: R$${total.toFixed(2)}</p>
        <a class="link" href="/produtos">Continuar Comprando</a>
        <a class="link" href="${req.cookies['lastPage'] || '/produtos'}">Voltar para a última página</a>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Aplicação rodando em http://localhost:${PORT}/`);
});
