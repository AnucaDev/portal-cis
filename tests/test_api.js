const http = require('http');

const data = JSON.stringify({
  nombre: "Carlos Martinez Ruiz",
  email: "carlos.martinez2@cis-madrid.es",
  telefono: "91 234 56 78",
  password: "password123",
  codigoAcceso: "CIS-PRO-2026"
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/registro-profesional',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();