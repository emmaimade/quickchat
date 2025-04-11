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
    socket.on('new-user', (username) => {
        console.log(username);
        const user = {
            id: socket.id,
            username,
            timestamp: moment().format('h:mm a')
        }

        users.push(user);
        console.log(user)
        socket.username = username;
        io.emit('user-connected', user);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})

server.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})