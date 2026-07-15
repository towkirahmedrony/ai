document.addEventListener('DOMContentLoaded', () => {
    // Local Storage Keys
    const STORAGE_KEY_CHATS = 'local_ai_chats';
    const STORAGE_KEY_SETTINGS = 'local_ai_settings';
    const STORAGE_KEY_CURRENT_CHAT = 'local_ai_current_chat';

    // State
    let chats = [];
    let currentChatId = null;
    let settings = {
        url: 'http://127.0.0.1:11434/v1/chat/completions',
        model: 'llama3',
        stream: true
    };
    let isGenerating = false;
    let currentAbortController = null;

    // DOM Elements
    const chatListEl = document.getElementById('chat-list');
    const chatContainerEl = document.getElementById('chat-container');
    const welcomeScreenEl = document.getElementById('welcome-screen');
    const messageInputEl = document.getElementById('message-input');
    const sendBtnEl = document.getElementById('send-btn');
    const currentChatTitleEl = document.getElementById('current-chat-title');

    // Sidebar Elements
    const sidebarEl = document.getElementById('sidebar');
    const menuBtnEl = document.getElementById('menu-btn');
    const closeSidebarBtnEl = document.getElementById('close-sidebar-btn');
    const newChatBtnEl = document.getElementById('new-chat-btn');

    // Settings Elements
    const settingsModalEl = document.getElementById('settings-modal');
    const settingsBtnEl = document.getElementById('settings-btn');
    const closeSettingsBtnEl = document.getElementById('close-settings-btn');
    const saveSettingsBtnEl = document.getElementById('save-settings-btn');
    const backendUrlInput = document.getElementById('backend-url');
    const modelNameInput = document.getElementById('model-name');
    const streamToggleInput = document.getElementById('stream-toggle');

    // Initialize Markdown Renderer safely
    if (typeof marked !== 'undefined') {
        const renderer = new marked.Renderer();
        renderer.code = function (code, language) {
            const validLanguage = (typeof hljs !== 'undefined' && hljs.getLanguage(language)) ? language : 'plaintext';
            const highlighted = (typeof hljs !== 'undefined') ? hljs.highlight(code, { language: validLanguage }).value : code;
            const encodedCode = encodeURIComponent(code);
            return `
                <div class="code-block-wrapper">
                    <div class="code-block-header">
                        <span class="code-lang">${validLanguage}</span>
                        <button class="copy-btn" data-code="${encodedCode}">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <pre><code class="hljs ${validLanguage}">${highlighted}</code></pre>
                </div>
            `;
        };
        marked.setOptions({ renderer });
    }

    // Initialization Function
    function init() {
        loadSettings();
        loadChats();
        setupEventListeners();
        
        if (!currentChatId && chats.length > 0) {
            switchChat(chats[0].id);
        } else if (currentChatId) {
            switchChat(currentChatId);
        } else {
            createNewChat();
        }
    }

    // Data Management
    function loadSettings() {
        const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (saved) {
            settings = { ...settings, ...JSON.parse(saved) };
        }
        backendUrlInput.value = settings.url;
        modelNameInput.value = settings.model;
        streamToggleInput.checked = settings.stream;
    }

    function saveSettings() {
        settings.url = backendUrlInput.value.trim();
        settings.model = modelNameInput.value.trim();
        settings.stream = streamToggleInput.checked;
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    }

    function loadChats() {
        const saved = localStorage.getItem(STORAGE_KEY_CHATS);
        if (saved) {
            chats = JSON.parse(saved);
        }
        currentChatId = localStorage.getItem(STORAGE_KEY_CURRENT_CHAT);
        renderChatList();
    }

    function saveChats() {
        localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
        if (currentChatId) {
            localStorage.setItem(STORAGE_KEY_CURRENT_CHAT, currentChatId);
        } else {
            localStorage.removeItem(STORAGE_KEY_CURRENT_CHAT);
        }
    }

    // Chat Management
    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    function createNewChat() {
        const newChat = {
            id: generateId(),
            title: 'New Chat',
            messages: [],
            createdAt: Date.now()
        };
        chats.unshift(newChat);
        saveChats();
        switchChat(newChat.id);
    }

    window.deleteChat = function(id, e) {
        if(e) e.stopPropagation();
        chats = chats.filter(c => c.id !== id);
        if (currentChatId === id) {
            currentChatId = chats.length > 0 ? chats[0].id : null;
        }
        saveChats();
        renderChatList();
        
        if (currentChatId) {
            switchChat(currentChatId);
        } else {
            createNewChat();
        }
    }

    window.renameChat = function(id, e) {
        if(e) e.stopPropagation();
        const chat = chats.find(c => c.id === id);
        if (!chat) return;
        
        const newTitle = prompt('Enter new chat name:', chat.title);
        if (newTitle && newTitle.trim()) {
            chat.title = newTitle.trim();
            saveChats();
            renderChatList();
            if (currentChatId === id) {
                currentChatTitleEl.textContent = chat.title;
            }
        }
    }

    window.switchChat = function(id) {
        currentChatId = id;
        saveChats();
        renderChatList();
        renderCurrentChat();
        if (window.innerWidth <= 768) {
            sidebarEl.classList.remove('open');
        }
    }

    // Rendering UI
    function renderChatList() {
        chatListEl.innerHTML = '';
        chats.forEach(chat => {
            const li = document.createElement('li');
            li.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
            li.onclick = () => window.switchChat(chat.id);
            
            li.innerHTML = `
                <i class="far fa-message"></i>
                <span class="chat-item-title">${chat.title}</span>
                <div class="chat-item-actions">
                    <button class="icon-btn" onclick="window.renameChat('${chat.id}', event)"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn" onclick="window.deleteChat('${chat.id}', event)"><i class="fas fa-trash"></i></button>
                </div>
            `;
            chatListEl.appendChild(li);
        });
    }

    function renderCurrentChat() {
        const chat = chats.find(c => c.id === currentChatId);
        if (!chat) return;

        currentChatTitleEl.textContent = chat.title;
        
        const messages = Array.from(chatContainerEl.children).filter(el => el.id !== 'welcome-screen');
        messages.forEach(m => m.remove());

        if (chat.messages.length === 0) {
            welcomeScreenEl.style.display = 'flex';
        } else {
            welcomeScreenEl.style.display = 'none';
            chat.messages.forEach(msg => {
                appendMessageUI(msg.role, msg.content);
            });
            scrollToBottom();
        }
    }

    function appendMessageUI(role, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        
        const iconClass = role === 'user' ? 'fa-user' : 'fa-robot';
        const parsedContent = (content && typeof marked !== 'undefined') ? marked.parse(content) : (content || '<div class="typing-indicator"></div>');

        msgDiv.innerHTML = `
            <div class="message-content">
                <div class="avatar ${role}">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="text-content markdown-body">
                    ${parsedContent}
                </div>
            </div>
        `;
        
        chatContainerEl.appendChild(msgDiv);
        return msgDiv;
    }

    function updateMessageUI(msgElement, content) {
        const textContentEl = msgElement.querySelector('.text-content');
        textContentEl.innerHTML = (typeof marked !== 'undefined') ? marked.parse(content) : content;
    }

    function scrollToBottom() {
        chatContainerEl.scrollTo({
            top: chatContainerEl.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Sending Messages & Backend
    async function sendMessage() {
        if (isGenerating) return;
        
        const content = messageInputEl.value.trim();
        if (!content) return;

        const chat = chats.find(c => c.id === currentChatId);
        if (!chat) return;

        if (chat.messages.length === 0) {
            chat.title = content.split(' ').slice(0, 4).join(' ') + '...';
            renderChatList();
            currentChatTitleEl.textContent = chat.title;
        }

        chat.messages.push({ role: 'user', content });
        saveChats();
        
        messageInputEl.value = '';
        messageInputEl.style.height = 'auto';
        updateSendButtonState();
        
        welcomeScreenEl.style.display = 'none';
        appendMessageUI('user', content);
        scrollToBottom();

        isGenerating = true;
        currentAbortController = new AbortController();
        
        const assistantMsgEl = appendMessageUI('assistant', '');
        scrollToBottom();

        try {
            const payload = {
                model: settings.model,
                messages: chat.messages.map(m => ({ role: m.role, content: m.content })),
                stream: settings.stream
            };

            const response = await fetch(settings.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: currentAbortController.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let fullResponse = '';

            if (settings.stream) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); 

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.substring(6).trim();
                            if (dataStr === '[DONE]') continue;
                            
                            try {
                                const data = JSON.parse(dataStr);
                                const chunk = data.choices[0]?.delta?.content || '';
                                if (chunk) {
                                    fullResponse += chunk;
                                    updateMessageUI(assistantMsgEl, fullResponse);
                                    scrollToBottom();
                                }
                            } catch (e) {}
                        }
                    }
                }
            } else {
                const data = await response.json();
                fullResponse = data.choices[0].message.content;
                updateMessageUI(assistantMsgEl, fullResponse);
                scrollToBottom();
            }

            chat.messages.push({ role: 'assistant', content: fullResponse });
            saveChats();

        } catch (error) {
            if (error.name !== 'AbortError') {
                updateMessageUI(assistantMsgEl, `**Error:** Could not connect. Details: \`${error.message}\``);
            }
        } finally {
            isGenerating = false;
            currentAbortController = null;
            updateSendButtonState();
        }
    }

    // Setup Listeners
    function setupEventListeners() {
        messageInputEl.addEventListener('input', () => {
            messageInputEl.style.height = 'auto';
            messageInputEl.style.height = (messageInputEl.scrollHeight) + 'px';
            messageInputEl.style.overflowY = messageInputEl.scrollHeight > 200 ? 'auto' : 'hidden';
            updateSendButtonState();
        });

        messageInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendBtnEl.addEventListener('click', sendMessage);
        newChatBtnEl.addEventListener('click', createNewChat);
        
        menuBtnEl.addEventListener('click', () => {
            sidebarEl.classList.add('open');
        });

        closeSidebarBtnEl.addEventListener('click', () => {
            sidebarEl.classList.remove('open');
        });

        settingsBtnEl.addEventListener('click', () => {
            settingsModalEl.classList.remove('hidden');
        });

        closeSettingsBtnEl.addEventListener('click', () => {
            settingsModalEl.classList.add('hidden');
        });

        saveSettingsBtnEl.addEventListener('click', () => {
            saveSettings();
            settingsModalEl.classList.add('hidden');
        });

        document.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('.copy-btn');
            if (copyBtn) {
                const code = decodeURIComponent(copyBtn.getAttribute('data-code'));
                navigator.clipboard.writeText(code).then(() => {
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => { copyBtn.innerHTML = originalHTML; }, 2000);
                });
            }
        });
    }

    function updateSendButtonState() {
        sendBtnEl.disabled = messageInputEl.value.trim() === '' || isGenerating;
    }

    // Start App
    init();
});
