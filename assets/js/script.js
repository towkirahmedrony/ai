// Configure Marked.js for Highlight.js integration and custom renderer for copy buttons
const renderer = new marked.Renderer();
renderer.code = function(code, language) {
    const validLang = !!(language && hljs.getLanguage(language));
    const lang = validLang ? language : 'plaintext';
    const highlighted = validLang ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value;

    return `
        <div class="code-wrapper">
            <div class="code-header">
                <span>${lang}</span>
                <button class="copy-code-btn">
                    <i class="ph ph-copy"></i> Copy
                </button>
            </div>
            <pre><code class="hljs ${lang}">${highlighted}</code></pre>
        </div>
    `;
};
marked.setOptions({
    renderer: renderer,
    breaks: true,
    gfm: true
});

// App State
let chats = JSON.parse(localStorage.getItem('ai_chats')) || [];
let currentChatId = null;
let isGenerating = false;

// Default Settings
let settings = JSON.parse(localStorage.getItem('ai_settings')) || {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o-mini',
    stream: true
};

// DOM Elements
const elements = {
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('sidebar-overlay'),
    menuBtn: document.getElementById('menu-btn'),
    newChatBtn: document.getElementById('new-chat-btn'),
    chatHistory: document.getElementById('chat-history'),
    chatContainer: document.getElementById('chat-container'),
    welcomeScreen: document.getElementById('welcome-screen'),
    chatTitle: document.getElementById('current-chat-title'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-btn'),

    // Settings Modals
    settingsModal: document.getElementById('settings-modal'),
    settingsOpenBtn: document.getElementById('settings-open-btn'),
    settingsCloseBtn: document.getElementById('settings-close-btn'),
    settingsSaveBtn: document.getElementById('settings-save-btn'),

    // Setting Inputs
    apiUrl: document.getElementById('api-url'),
    apiKey: document.getElementById('api-key'),
    apiModel: document.getElementById('api-model'),
    apiStream: document.getElementById('api-stream')
};

// Initialize App
function init() {
    loadSettingsToUI();
    renderSidebar();

    if (chats.length > 0) {
        loadChat(chats[0].id);
    } else {
        createNewChat();
    }

    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    // Mobile Sidebar
    elements.menuBtn.addEventListener('click', () => {
        elements.sidebar.classList.add('open');
        elements.overlay.classList.add('active');
    });

    elements.overlay.addEventListener('click', closeSidebar);

    // Input Auto-resize & Submit
    elements.messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        elements.sendBtn.disabled = this.value.trim().length === 0 || isGenerating;
    });

    elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!elements.sendBtn.disabled) handleSend();
        }
    });

    elements.sendBtn.addEventListener('click', handleSend);

    // Chat Management
    elements.newChatBtn.addEventListener('click', () => {
        createNewChat();
        closeSidebar();
    });

    // Settings
    elements.settingsOpenBtn.addEventListener('click', openSettings);
    elements.settingsCloseBtn.addEventListener('click', closeSettings);
    elements.settingsSaveBtn.addEventListener('click', saveSettings);

    // Global delegation for dynamic elements
    document.addEventListener('click', (e) => {
        // Copy Code delegation
        const copyBtn = e.target.closest('.copy-code-btn');
        if (copyBtn) {
            const codeBlock = copyBtn.closest('.code-wrapper').querySelector('code');
            navigator.clipboard.writeText(codeBlock.innerText).then(() => {
                const originalHtml = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="ph ph-check"></i> Copied';
                setTimeout(() => copyBtn.innerHTML = originalHtml, 2000);
            });
        }
    });
}

function closeSidebar() {
    elements.sidebar.classList.remove('open');
    elements.overlay.classList.remove('active');
}

// --- Settings Logic ---
function loadSettingsToUI() {
    elements.apiUrl.value = settings.baseUrl;
    elements.apiKey.value = settings.apiKey;
    elements.apiModel.value = settings.model;
    elements.apiStream.checked = settings.stream;
}

function openSettings() {
    loadSettingsToUI();
    elements.settingsModal.classList.add('active');
}

function closeSettings() {
    elements.settingsModal.classList.remove('active');
}

function saveSettings() {
    settings = {
        baseUrl: elements.apiUrl.value.trim().replace(/\/$/, ''),
        apiKey: elements.apiKey.value.trim(),
        model: elements.apiModel.value.trim(),
        stream: elements.apiStream.checked
    };
    localStorage.setItem('ai_settings', JSON.stringify(settings));
    closeSettings();
}

// --- Chat Management ---
function createNewChat() {
    const newChat = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: []
    };
    chats.unshift(newChat);
    saveChats();
    loadChat(newChat.id);
    renderSidebar();
}

function saveChats() {
    localStorage.setItem('ai_chats', JSON.stringify(chats));
}

function getChat(id) {
    return chats.find(c => c.id === id);
}

function loadChat(id) {
    currentChatId = id;
    const chat = getChat(id);
    if (!chat) return;

    elements.chatTitle.textContent = chat.title;
    elements.chatContainer.innerHTML = '';

    if (chat.messages.length === 0) {
        elements.chatContainer.appendChild(elements.welcomeScreen);
        elements.welcomeScreen.style.display = 'flex';
    } else {
        elements.welcomeScreen.style.display = 'none';
        chat.messages.forEach(msg => {
            renderMessage(msg.role, msg.content, false);
        });
        scrollToBottom();
    }

    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.getElementById(`chat-${id}`);
    if (activeItem) activeItem.classList.add('active');
}

function renderSidebar() {
    elements.chatHistory.innerHTML = '';
    chats.forEach(chat => {
        const div = document.createElement('div');
        div.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
        div.id = `chat-${chat.id}`;
        div.innerHTML = `
            <div class="chat-item-title">${DOMPurify.sanitize(chat.title)}</div>
            <div class="chat-item-actions">
                <button class="action-btn rename" title="Rename"><i class="ph ph-pencil-simple"></i></button>
                <button class="action-btn delete" title="Delete"><i class="ph ph-trash"></i></button>
            </div>
        `;

        div.addEventListener('click', (e) => {
            if (e.target.closest('.rename')) {
                renameChat(chat.id);
            } else if (e.target.closest('.delete')) {
                deleteChat(chat.id);
            } else {
                loadChat(chat.id);
                closeSidebar();
            }
        });

        elements.chatHistory.appendChild(div);
    });
}

function renameChat(id) {
    const chat = getChat(id);
    const newTitle = prompt('Enter new chat name:', chat.title);
    if (newTitle && newTitle.trim()) {
        chat.title = newTitle.trim();
        saveChats();
        renderSidebar();
        if (currentChatId === id) elements.chatTitle.textContent = chat.title;
    }
}

function deleteChat(id) {
    if (confirm('Are you sure you want to delete this chat?')) {
        chats = chats.filter(c => c.id !== id);
        saveChats();
        if (chats.length === 0) {
            createNewChat();
        } else if (currentChatId === id) {
            loadChat(chats[0].id);
        }
        renderSidebar();
    }
}

function updateChatTitle(chat, firstMessage) {
    if (chat.title === 'New Chat') {
        const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
        chat.title = title;
        elements.chatTitle.textContent = title;
        saveChats();
        renderSidebar();
    }
}

// --- UI Rendering ---
function renderMessage(role, content, isStreaming = false) {
    if (elements.welcomeScreen.style.display !== 'none') {
        elements.welcomeScreen.style.display = 'none';
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';

    const icon = role === 'user' ? '<i class="ph ph-user"></i>' : '<i class="ph ph-robot"></i>';
    const avatarClass = role === 'user' ? 'user-avatar' : 'ai-avatar';

    // Parse Markdown securely
    const parsedContent = DOMPurify.sanitize(marked.parse(content));

    msgDiv.innerHTML = `
        <div class="avatar ${avatarClass}">${icon}</div>
        <div class="message-content markdown-body" data-raw="${encodeURIComponent(content)}">
            ${parsedContent}
        </div>
    `;

    elements.chatContainer.appendChild(msgDiv);
    return msgDiv;
}

function showTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message typing-msg';
    msgDiv.innerHTML = `
        <div class="avatar ai-avatar"><i class="ph ph-robot"></i></div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    elements.chatContainer.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
}

function removeTypingIndicator() {
    const typingMsg = elements.chatContainer.querySelector('.typing-msg');
    if (typingMsg) typingMsg.remove();
}

function scrollToBottom() {
    elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

// --- API Interaction ---
async function handleSend() {
    if (!settings.apiKey) {
        alert('Please configure your API Key in settings first.');
        openSettings();
        return;
    }

    const content = elements.messageInput.value.trim();
    if (!content) return;

    // Reset input
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    elements.sendBtn.disabled = true;
    isGenerating = true;

    // Process User Message
    const chat = getChat(currentChatId);
    chat.messages.push({ role: 'user', content });
    renderMessage('user', content);
    updateChatTitle(chat, content);
    saveChats();
    scrollToBottom();

    const typingEl = showTypingIndicator();

    try {
        const payload = {
            model: settings.model,
            messages: chat.messages,
            stream: settings.stream
        };

        const response = await fetch(`${settings.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.apiKey}`,
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`HTTP Error ${response.status}: ${errBody}`);
        }

        removeTypingIndicator();

        if (settings.stream) {
            await handleStreamingResponse(response, chat);
        } else {
            await handleStandardResponse(response, chat);
        }

    } catch (error) {
        removeTypingIndicator();
        console.error(error);
        renderError(error.message);
    } finally {
        isGenerating = false;
        elements.sendBtn.disabled = elements.messageInput.value.trim().length === 0;
    }
}

async function handleStandardResponse(response, chat) {
    const data = await response.json();
    const reply = data.choices[0].message.content || '';

    chat.messages.push({ role: 'assistant', content: reply });
    saveChats();
    renderMessage('assistant', reply);
    scrollToBottom();
}

async function handleStreamingResponse(response, chat) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // Create empty message container for streaming
    const msgEl = renderMessage('assistant', '');
    const contentEl = msgEl.querySelector('.message-content');

    let fullResponse = '';
    let buffer = '';

    chat.messages.push({ role: 'assistant', content: '' }); // placeholder
    const msgIndex = chat.messages.length - 1;

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete lines in buffer

            for (const line of lines) {
                const cleanLine = line.trim();
                if (!cleanLine || !cleanLine.startsWith('data: ')) continue;

                const dataStr = cleanLine.slice(6);
                if (dataStr === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(dataStr);
                    const delta = parsed.choices[0]?.delta?.content;
                    if (delta) {
                        fullResponse += delta;
                        // Update UI progressively
                        contentEl.innerHTML = DOMPurify.sanitize(marked.parse(fullResponse));
                        scrollToBottom();
                    }
                } catch (e) {
                    console.warn("Chunk parsing error:", e, "Data:", dataStr);
                }
            }
        }
    } finally {
        // Save final content
        chat.messages[msgIndex].content = fullResponse;
        saveChats();
        // Final render to ensure syntax highlighting runs on complete blocks
        contentEl.innerHTML = DOMPurify.sanitize(marked.parse(fullResponse));
        scrollToBottom();
    }
}

function renderError(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';
    msgDiv.innerHTML = `
        <div class="avatar ai-avatar" style="background-color: var(--danger)"><i class="ph ph-warning"></i></div>
        <div class="message-content error-msg">
            <p><strong>Error Generating Response:</strong></p>
            <p>${DOMPurify.sanitize(message)}</p>
        </div>
    `;
    elements.chatContainer.appendChild(msgDiv);
    scrollToBottom();
}

// Start
init();
