import { WebSocketServer } from 'ws';
import { createServer } from 'https';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config()

const options = {
  key: fs.readFileSync(process.env.KEY_PATH),
  cert: fs.readFileSync(process.env.CERT_PATH),
};

// Respond to HTTP(S) requests too
const server = createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('WebSocket server is running');
});

server.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Server listening on PORT: ${process.env.PORT}` );
});

const wss = new WebSocketServer({ server });

wss.on('connection', (socket) => {
  socket.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (err) {
      console.error('Invalid JSON:', err);
      return;
    }

    switch (data.event) {
      case 'register':
        console.log('register: ', data.id);
        socket.uid = data.id;
        socket.send(JSON.stringify({ event: 'register_success' }));
        break;

      case 'unlocked':
        console.log('unlock: ', data.id);
        wss.clients.forEach((client) => {
          if (client.uid === data.id) {
            client.send(JSON.stringify({ event: 'unlocked', id: data.id }));
          }
        });
        break;

      default:
        console.log('Received event:', data.event);
        break;
    }
  });
});
