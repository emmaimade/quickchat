const currentUser = document.getElementById('current-user');
const chatArea = document.getElementById('chat-area');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message');

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

// Simple state management
const appState = {
    currentUser: null,
    isConnected: false,
    
    // Similar to React's useState
    setUser(username) {
      this.currentUser = username;
      this.updateUI();
    },
    
    setConnected(status) {
      this.isConnected = status;
      this.updateUI();
    },
    
    updateUI() {
      // Update any UI elements that depend on state
      if (this.currentUser) {
        document.getElementById('current-user').textContent = this.currentUser;
      }
    }
};

socket.on('connect', () => {
    appState.setConnected(true);
    if (username) {
        console.log(username);
        const user = decodeURIComponent(username);
        appState.setUser(user)
        socket.emit('new-user', user);
    } else {
        window.location.href = '/';
    }
})

// user welcome message
socket.on('welcome-message', (data) => {
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message system-message';
    welcomeMessage.innerHTML = `
    <span class="message-header">
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
    notification.className = 'notification user-join';
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

// reconnect handler
socket.on('reconnect', () => {
    if (appState.currentUser) {
      // Re-register user without page reload
      socket.emit('new-user', appState.currentUser);
    }
});

// disconnect handler
socket.on('disconnect', () => {
    appState.setConnected(false);

    // Show temporary disconnect message
    const notification = document.createElement('div');
    notification.className = 'notification connection';
    notification.textContent = 'Connection lost - attempting to reconnect...';
    chatArea.appendChild(notification);
    scrollToBottom();
})

// user leave message
socket.on('user-leave', (data) => {
    if(!data.username || !appState.currentUser) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification user-left';
    notification.innerHTML = `
        <span class="notification-timestamp">${data.timestamp}<span>
        <span class="notification-text">${data.username} has left the chat</span>
    `;
    chatArea.appendChild(notification);
    scrollToBottom();
})

// message helper function
function addMessage(data) {
    const message = document.createElement('div');
    message.className = 'message user-message';
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