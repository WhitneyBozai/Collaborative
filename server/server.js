const http = require('http');
const { WebSocketServer } = require('ws');

// Create an HTTP server 
const server = http.createServer((req, res) => {
    res.writeHead(200, {"Content-Type":"text/plain"});
    res.end("WebSocket server running");
});

// creating a WebSocket Server to allow "persistent connection"
const wss = new WebSocketServer({ server });

// Store drawing history and chat history
let drawHistory = [];
let chatHistory = [];

// telling the server what to do when it gets a new connection
wss.on("connection", (socket) => {
    console.log("Client connected");

    // Send all previous drawing history to the newly connected client
    drawHistory.forEach(msg => socket.send(JSON.stringify(msg)));

    // Send all previous chat history to the newly connected client
    chatHistory.forEach(msg => socket.send(JSON.stringify(msg)));

    // telling the server what to do when it receives a new message on that connection
    socket.on("message", (data) => {
        const msg = JSON.parse(data.toString());

        // If the message is a drawing or erasing event, store it
        if (msg.type === 'draw' || msg.type === 'erase') {
            drawHistory.push(msg);

        // If the message is a chat message, store it
        } else if (msg.type === 'chat') {
            chatHistory.push(msg);

        // If the message requests clearing the canvas, reset drawing history
        } else if (msg.type === 'clearCanvas') {
            drawHistory = [];

        // If the message requests clearing the chat, reset chat history
        } else if (msg.type === 'clearChat') {
            chatHistory = [];
        }

        // Broadcast the received message to all connected clients
        wss.clients.forEach(client => {
            if(client.readyState === client.OPEN){
                client.send(JSON.stringify(msg));
            }
        });
    });

    // Log when a client disconnects
    socket.on("close", () => console.log("Client disconnected"));
});

// Start the server on port 3000
server.listen(3000, () => console.log("Server running at ws://localhost:3000"));
