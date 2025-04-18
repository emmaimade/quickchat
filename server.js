import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import moment from 'moment';

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

let users = []
const pendingDisconnects = new Map();

io.on('connection', (socket) => {
    let username = null;

    socket.on('new-user', (name) => {
        username = name;

        // clear pending disconnect
        if (pendingDisconnects.has(username)) {
            clearTimeout(pendingDisconnects.get(username));
            pendingDisconnects.delete(username);
        }

        // check if user already exists
        if (users.some(user => user.username === username)) {
            const existingUser = users.find(user => user.username === username);
            existingUser.id = socket.id;
        } else {
            const user = {
                id: socket.id,
                username,
                timestamp: moment().format('h:mm a')
            }
    
            users.push(user);
            socket.username = username;
    
            // send welcome message to user
            socket.emit('welcome-message', {
                message: `Welcome to QuickChat, ${username}!`,
                timestamp: user.timestamp,
                sender: 'QuickChat Bot'
            })
    
            // broadcast join to all users
            socket.broadcast.emit('user-join', user);
        }
    });

    socket.on('send-message', (data) => {
        // broadcast message to all users
        io.emit('receive-message', {
            username: data.username,
            message: data.message,
            timestamp: moment().format('h:mm a')
        })
    });

    socket.on('disconnect', () => {
        if (username) {
            const timeout = setTimeout(() => {
                users = users.filter(user => user.username !== username);
                // broadcast leave message to all users
                socket.broadcast.emit('user-leave', {
                username,
                timestamp: moment().format('h:mm a')
                });
                pendingDisconnects.delete(username);
            }, 5000); // 5 seconds grace period
            
            pendingDisconnects.set(username, timeout);
        }
    })
})

server.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})