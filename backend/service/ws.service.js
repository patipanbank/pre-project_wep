const WebSocket = require('ws');
const Datas = require('../model/data');
let wss;

const initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server });
  
  wss.on('connection', async (ws) => {
    console.log('New WebSocket client connected');
    
    try {
      // Fetch all data when a client connects, including both on and off available
      const allData = await Datas.findAll({
        raw: true
      });
      
      // Send initial data to the newly connected client
      ws.send(JSON.stringify({
        type: 'initialData',
        data: allData
      }));
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
};
const notifyWebSocketClients = (type, data) => {
    if (!wss) return;
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type,
          data
        }));
      }
    });
};
  
module.exports = {
    initializeWebSocket,
    notifyWebSocketClients
};
  