const currentUser = document.getElementById('current-user');
const chatArea = document.getElementById('chat-area');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message');

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

if (username) {
    console.log(username);
    currentUser.textContent = decodeURIComponent(username);

    socket.emit('new-user', decodeURIComponent(username));
} else {
    window.location.href = '/';
}

// user welcome message
socket.on('welcome-message', (data) => {
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message system-message';
    welcomeMessage.innerHTML = `
    <span class="messager-header">
        <span class="sender">${data.sender}</span>
        <span class="timestamp">${data.timestamp}</span> 
    </span>
    <div class="message-content">${data.message}</div>
    `;
    chatArea.appendChild(welcomeMessage);
    scrollToBottom(); 
})

// user join message
socket.on('user-join', (data) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span class="notification-timestamp">${data.timestamp}</span>
        <span class="notification-text">${data.username} has joined the chat</span>
    `;
    chatArea.appendChild(notification);
    scrollToBottom();
})

// submit and send message to server
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('send-message', {
            username: decodeURIComponent(username),
            message
        });
        // clear input
        messageInput.value = '';
        messageInput.focus()
    }
});

// handle incoming message from server
socket.on('receive-message', (data) => {
    addMessage(data);
})

// message helper function
function addMessage(data) {
    const message = document.createElement('div');
    message.className = 'message';
    message.innerHTML = `
        <div class="message-header">
            <span class="sender">${data.username}</span>
            <span class="timestamp">${data.timestamp}</span> 
        </div>
        <div class="message-content">${data.message}</div>
    `;
    chatArea.appendChild(message);
    scrollToBottom();
}

// scroll to bottom
function scrollToBottom() {
    chatArea.scrollTop = chatArea.scrollHeight;
}