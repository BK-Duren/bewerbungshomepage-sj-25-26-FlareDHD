import http from 'http';

http.get('http://127.0.0.1:3000', (resp) => {
  let data = '';
  resp.on('data', chunk => data += chunk);
  resp.on('end', () => {
    process.stdout.write(data);
  });
}).on('error', err => {
  console.error('error', err);
});