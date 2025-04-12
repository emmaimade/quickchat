const currentUser = document.getElementById('current-user');
const chatArea = document.getElementById('chat-area');

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

function scrollToBottom() {
    chatArea.scrollTop = chatArea.scrollHeight;
}