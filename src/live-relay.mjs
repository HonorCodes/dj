import { createServer } from 'http';

const PORT = 4322;
const clients = new Set();

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('data: connected\n\n');
    clients.add(res);
    console.log(`Client connected (${clients.size} total)`);
    req.on('close', () => {
      clients.delete(res);
      console.log(`Client disconnected (${clients.size} total)`);
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/push') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const encoded = JSON.stringify(body);
      for (const client of clients) {
        client.write(`data: ${encoded}\n\n`);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, clients: clients.size }));
      console.log(`Pushed ${body.length} chars to ${clients.size} client(s)`);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Live relay on :${PORT} — GET /stream, POST /push`);
});
