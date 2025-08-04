const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>Teste</title></head>
      <body>
        <h1>Servidor funcionando!</h1>
        <p>Node.js está funcionando corretamente.</p>
      </body>
    </html>
  `);
});

server.listen(3000, () => {
  console.log('Servidor de teste rodando em http://localhost:3000');
}); 