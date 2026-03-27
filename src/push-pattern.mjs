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
