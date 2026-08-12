const http = require('http');

const PORT = process.env.PORT || 8083;
const WHATSAPP_BACKEND = process.env.WHATSAPP_BACKEND || 'http://localhost:8080';
const WHATSAPP_API_KEY = process.env.EVOLUTION_API_KEY || 'CustomerAI_Secure2026_Evolution';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url.replace(/^\/|\/$/g, '');

  // Status endpoint - proxy to Evolution API
  if (url === 'status') {
    proxyToEvolution('/instance/connectionState/customerai', 'GET', null, res);
    return;
  }

  // QR code endpoint - proxy to Evolution API
  if (url === 'qrcode') {
    proxyToEvolution('/instance/connect/customerai', 'GET', null, res);
    return;
  }

  // Connect endpoint - get QR code from Evolution API (use GET, not POST)
  if (url === 'connect') {
    proxyToEvolution('/instance/connect/customerai', 'GET', null, res);
    return;
  }

  // Disconnect endpoint
  if (url === 'disconnect') {
    proxyToEvolution('/instance/logout/customerai', 'POST', '{}', res);
    return;
  }

  // Check number endpoint - proxy to Evolution API
  if (url === 'checkNumber' || url.startsWith('checkNumber/')) {
    const phone = url.replace('checkNumber/', '');
    proxyToEvolution(`/chat/checkNumber/${phone}`, 'GET', null, res);
    return;
  }

  // Default - proxy everything else
  proxyRequest(WHATSAPP_BACKEND + '/' + url, req.method, req.method === 'POST' ? '' : null, res);
});

function proxyToEvolution(path, method, postData, res) {
  const urlObj = new URL(WHATSAPP_BACKEND + path);
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || 80,
    path: urlObj.pathname,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': WHATSAPP_API_KEY
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      // Transform Evolution API response to our format
      let responseData = {};
      try {
        const parsed = JSON.parse(data);

        if (path.includes('connectionState')) {
          // Transform connection state response to match frontend expectations
          const instanceState = parsed.instance?.state || 'close';
          let status = 'DISCONNECTED';
          let connectionStatus = 'offline';

          if (instanceState === 'open') {
            status = 'CONNECTED';
            connectionStatus = 'online';
          } else if (instanceState === 'connecting') {
            status = 'CONNECTING';
            connectionStatus = 'connecting';
          }

          responseData = {
            success: true,
            status: status,
            connectionStatus: connectionStatus,
            instanceName: parsed.instance?.instanceName || 'customerai'
          };
        } else if (path.includes('connect')) {
          // Transform QR code response - wrap in qrCode object for frontend compatibility
          responseData = {
            success: true,
            hasQR: !!parsed.code,
            qrCode: {
              qrCode: parsed.base64 || null,
              qrString: parsed.code || null,
              code: parsed.count || 0
            }
          };
        } else {
          responseData = parsed;
        }
      } catch (e) {
        responseData = { raw: data };
      }

      res.writeHead(proxyRes.statusCode || 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(responseData));
    });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  });

  proxyReq.setTimeout(10000, () => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Timeout' }));
  });

  if (postData) {
    proxyReq.write(postData);
  }
  proxyReq.end();
}

function proxyRequest(path, method, postData, res) {
  const urlObj = new URL(path);
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || 80,
    path: urlObj.pathname,
    method: method,
    headers: { 'Content-Type': 'application/json' }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      res.writeHead(proxyRes.statusCode || 200, { 'Content-Type': 'application/json' });
      res.end(data || '{}');
    });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  });

  proxyReq.setTimeout(10000, () => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Timeout' }));
  });

  if (postData) {
    proxyReq.write(postData);
  }
  proxyReq.end();
}

server.listen(PORT, () => {
  console.log('[WhatsApp Connector] Started on port', PORT);
  console.log('[WhatsApp Connector] Backend:', WHATSAPP_BACKEND);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
