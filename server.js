import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("home.ejs");
})

app.get("/chat", (req, res) => {
    res.render("chat.ejs");
})

app.get("/group", (req, res) => {
    res.render("group.ejs");
})

server.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})