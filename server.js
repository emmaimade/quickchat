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

io.on('connection', (socket) => {
    let registered = false;

    socket.on('new-user', (username) => {
        const user = {
            id: socket.id,
            username,
            timestamp: moment().format('h:mm a')
        }

        users.push(user);
        registered = true;
        socket.username = username;

        // send welcome message to user
        socket.emit('welcome-message', {
            message: `Welcome to QuickChat, ${username}!`,
            timestamp: moment().format('h:mm a'),
            sender: 'QuickChat Bot'
        })

        // broadcast join to all users
        socket.broadcast.emit('user-join', user);
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
        if (!registered) return;

        const disconnectedUser = users.find(user => user.id === socket.id);

        if (disconnectedUser) {
            // broadcast leave message to all users
            socket.broadcast.emit('user-leave', {
                username: socket.username,
                timestamp: moment().format('h:mm a')
            });
        }

        users = users.filter(user => user.id !== socket.id);
    })
})

server.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})