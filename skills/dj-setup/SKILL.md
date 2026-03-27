---
name: dj-setup
description: One-time setup for the /dj skill. Clones Strudel REPL, installs dependencies, deploys the SSE relay server, and patches the browser client for live code injection. Run this once before using /dj.
---

# dj-setup

One-time bootstrapping of the Strudel live coding environment.
Every step below requires explicit user confirmation before executing.
Do NOT proceed to the next step until the user says yes.

---

## Step 1: Check prerequisites

Confirm with the user before running these checks.

1. Verify Node.js 18+ is installed:

```bash
node --version
```

If the version is below 18, stop and tell the user to upgrade.

2. Check if pnpm is available:

```bash
which pnpm
```

If pnpm is not found, ask the user for permission to install it:

```bash
npm install -g pnpm
```

---

## Step 2: Locate or clone Strudel

Ask the user where they want Strudel installed. Suggest `~/src/strudel` as the default.

Store the chosen path as `STRUDEL_PATH` for all subsequent steps.

1. Check if the directory already exists:

```bash
ls -d <STRUDEL_PATH> 2>/dev/null
```

2. If it does NOT exist, clone Strudel:

```bash
git clone https://codeberg.org/uzu/strudel.git <STRUDEL_PATH>
```

3. Install dependencies:

```bash
cd <STRUDEL_PATH> && pnpm i
```

This may take several minutes. Run it and wait for completion.

---

## Step 3: Deploy relay server

Write the file `<STRUDEL_PATH>/live-relay.mjs` with the following exact contents.
Ask the user for confirmation before writing.

```javascript
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
```

---

## Step 4: Deploy push helper

Write the file `<STRUDEL_PATH>/push-pattern.mjs` with the following exact contents.
Ask the user for confirmation before writing.

```javascript
import { readFileSync } from 'fs';

let code;
if (process.argv[2]) {
  code = readFileSync(process.argv[2], 'utf-8');
} else {
  code = readFileSync('/dev/stdin', 'utf-8');
}

const res = await fetch('http://localhost:4322/push', {
  method: 'POST',
  body: code,
});
const json = await res.json();
console.log(`Pushed to ${json.clients} client(s)`);
```

---

## Step 5: Patch HeadCommon.astro

Locate the file at `<STRUDEL_PATH>/website/src/components/HeadCommon.astro`.

1. Read the file first.
2. Check if `[live-relay]` already appears in the file content. If it does, skip this step and tell the user the patch is already applied.
3. If NOT present, ask the user for confirmation, then append this block to the end of the file:

```html
<!-- Live relay: receives code pushes via SSE -->
<script is:inline>
  (function() {
    var es = new EventSource('http://localhost:4322/stream');
    es.onopen = function() {
      console.log('[live-relay] SSE connected to :4322');
    };
    es.onmessage = function(e) {
      if (e.data === 'connected') return;
      var code;
      try { code = JSON.parse(e.data); } catch(err) { return; }
      console.log('[live-relay] received ' + code.length + ' chars');
      function tryEval() {
        var sm = window.strudelMirror;
        if (!sm) { setTimeout(tryEval, 500); return; }
        var view = sm.editor;
        if (view) {
          view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: code }
          });
        }
        setTimeout(function() {
          sm.evaluate().then(function() {
            console.log('[live-relay] evaluated');
          }).catch(function(err) {
            console.error('[live-relay] error:', err);
          });
        }, 50);
      }
      tryEval();
    };
    es.onerror = function() {
      console.log('[live-relay] SSE reconnecting...');
    };
  })();
</script>
```

---

## Step 6: Start servers

Ask the user for confirmation before starting the servers.

1. Start the Strudel dev server in the background:

```bash
cd <STRUDEL_PATH> && pnpm dev
```

Run this with `run_in_background: true`. It stays running.

2. Start the relay server in the background:

```bash
cd <STRUDEL_PATH> && node live-relay.mjs
```

Run this with `run_in_background: true`. It stays running.

3. Wait a few seconds, then verify the dev server is responding:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:4321/
```

Expect HTTP 200. If not, wait a bit longer and retry (the Astro dev server can take 10-20 seconds to start).

4. Verify the relay server is responding:

```bash
curl -s http://localhost:4322/push \
  -X POST -d 'test'
```

Expect a JSON response like `{"ok":true,"clients":0}`.

Report the results to the user.

---

## Step 7: User verification

Tell the user:

1. Open `http://localhost:4321/` in your browser.
2. Press F12 to open the browser console.
3. Look for the message: `[live-relay] SSE connected to :4322`

Once the user confirms they see the message, setup is complete. The `/dj` skill is now ready to use.

---

## Teardown

When the user wants to stop the live coding environment, run these steps:

1. Kill the relay server:

```bash
kill $(lsof -ti:4322)
```

2. Kill the Strudel dev server:

```bash
kill $(lsof -ti:4321)
```

3. To unpatch `HeadCommon.astro`, open `<STRUDEL_PATH>/website/src/components/HeadCommon.astro` and remove everything from `<!-- Live relay: receives code pushes via SSE -->` to the closing `</script>` tag (inclusive).
