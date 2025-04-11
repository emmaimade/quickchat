const form = document.getElementById('username-form');
const usernameInput = document.getElementById('username');

const socket = io();

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (usernameInput.value) {
        socket.emit('new-user', usernameInput.value);
        window.location.href = `/chat.html?username=${encodeURIComponent(usernameInput.value)}`;
        usernameInput.value = '';
    }
});

socket.on('user-connected', (data) => {
    console.log(data);
})