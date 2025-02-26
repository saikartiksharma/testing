const socket = io();
const chatHistory = document.querySelector('.chat-history');
let currentAIMessageElement = null;

function sendMessage() {
    const query = document.getElementById('queryInput').value.trim();
    if (query) {
        // Display the user's message
        const userMsg = `<div class="message user-msg">${query}</div>`;
        chatHistory.innerHTML += userMsg;

        // Create a placeholder for the AI's response
        currentAIMessageElement = document.createElement('div');
        currentAIMessageElement.classList.add('message', 'llm-msg');
        currentAIMessageElement.textContent = ''; // Start with an empty message
        chatHistory.appendChild(currentAIMessageElement);

        // Scroll to the latest message
        scrollToBottom();

        // Send the message to the server
        socket.emit('chat message', query);

        // Clear the input field
        document.getElementById('queryInput').value = '';
    }
}

socket.on('partial response', (data) => {
    // Append the partial response to the AI's message element
    if (currentAIMessageElement) {
        currentAIMessageElement.textContent += data.response;
        scrollToBottom(); // Scroll to the bottom after each partial update
    }
});

socket.on('chat message', (data) => {
    // Finalize the AI's response (if needed)
    if (currentAIMessageElement) {
        currentAIMessageElement.textContent = data.response; // Replace with the full response
        currentAIMessageElement = null; // Reset the placeholder
    }

    // Scroll to the bottom after the final response
    scrollToBottom();
});

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function scrollToBottom() {
    chatHistory.scrollTo({
        top: chatHistory.scrollHeight,
        behavior: 'smooth' // Adds smooth scrolling
    });
}

// Greeting message
socket.on('connect', () => {
    const greeting = new Date().getHours() >= 12 ? 'Good afternoon' : 'Good morning';
    const userName = 'User'; // You can replace this with actual user name if available
    const greetingMessage = `${greeting}, ${userName}. How can I help you today?`;
    const llmMsg = `<div class="message llm-msg">${greetingMessage}</div>`;
    chatHistory.innerHTML += llmMsg;
    scrollToBottom(); // Scroll to the bottom after the greeting
});