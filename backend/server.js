const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let players = []; 
let currentGameState = {};

app.use(express.static(path.join(__dirname, '../frontend')));

wss.on('connection', (ws) => {
    console.log('New player connected');
    const playerId = players.length + 1;
    players.push({ id: playerId, ws });

    ws.send(JSON.stringify({ type: 'welcome', playerId }));
    ws.send(JSON.stringify({ type: 'gameState', state: currentGameState }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'gameStateUpdate':
                broadcastGameState(data, ws);
                break;

            case 'playerMove':
                handlePlayerMove(data, ws);
                break;

            default:
                console.error('Unknown message type:', data.type);
                break;
        }
    });

    ws.on('close', () => {
        console.log('Player disconnected');
        players = players.filter(player => player.ws !== ws);
    });
});

function broadcastGameState(data, senderWs) {
    currentGameState = { ...currentGameState, ...data };

    players.forEach(player => {
        if (player.ws !== senderWs && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(data));
        }
    });
}

function handlePlayerMove(data, senderWs) {
    const senderPlayer = players.find(player => player.ws === senderWs);
    data.playerId = senderPlayer.id;

    broadcastGameState(data, senderWs);
}

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
