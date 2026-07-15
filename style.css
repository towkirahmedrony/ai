:root {
    --bg-color: #212121;
    --sidebar-bg: #171717;
    --item-hover: #2f2f2f;
    --item-active: #383838;
    --text-primary: #ececec;
    --text-secondary: #b4b4b4;
    --border-color: #383838;
    --accent-color: #10a37f;
    --accent-hover: #1a7f64;
    --user-msg-bg: #2f2f2f;
    --assistant-msg-bg: transparent;
    --code-bg: #0d0d0d;
    --danger-color: #ef4444;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--bg-color);
    color: var(--text-primary);
    height: 100dvh;
    overflow: hidden;
}

#app {
    display: flex;
    height: 100vh;
    width: 100vw;
}

/* Sidebar */
.sidebar {
    width: 260px;
    background-color: var(--sidebar-bg);
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border-color);
    transition: transform 0.3s ease;
    z-index: 100;
}

.sidebar-header {
    padding: 16px;
    display: flex;
    gap: 10px;
}

.btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-weight: 500;
    width: 100%;
}

.primary-btn {
    background-color: var(--accent-color);
    color: white;
}

.primary-btn:hover {
    background-color: var(--accent-hover);
}

.secondary-btn {
    background-color: var(--item-hover);
    color: var(--text-primary);
}

.secondary-btn:hover {
    background-color: var(--item-active);
}

.icon-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.icon-btn:hover {
    color: var(--text-primary);
    background-color: var(--item-hover);
}

.chat-list-container {
    flex: 1;
    overflow-y: auto;
    padding: 0 12px;
}

.chat-list-container::-webkit-scrollbar {
    width: 6px;
}
.chat-list-container::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 3px;
}

.chat-list {
    list-style: none;
}

.chat-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 4px;
    color: var(--text-primary);
    font-size: 14px;
    group: chat-item;
}

.chat-item:hover, .chat-item.active {
    background-color: var(--item-active);
}

.chat-item-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 10px;
}

.chat-item-actions {
    display: none;
    gap: 4px;
}

.chat-item:hover .chat-item-actions {
    display: flex;
}

.sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--border-color);
}

/* Main Content */
#main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
}

.top-bar {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    height: 56px;
}

.top-bar h1 {
    font-size: 16px;
    font-weight: 500;
    margin-left: 10px;
}

#menu-btn {
    display: none;
}

.chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px 0;
    scroll-behavior: smooth;
}

.welcome-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: var(--text-secondary);
}

.welcome-screen h2 {
    font-size: 28px;
    margin-bottom: 10px;
    color: var(--text-primary);
}

.message {
    padding: 24px 20px;
    display: flex;
    justify-content: center;
}

.message.user {
    background-color: var(--user-msg-bg);
}

.message-content {
    max-width: 800px;
    width: 100%;
    display: flex;
    gap: 20px;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
}

.avatar.user {
    background-color: #5436da;
    color: white;
}

.avatar.assistant {
    background-color: var(--accent-color);
    color: white;
}

.text-content {
    flex: 1;
    line-height: 1.6;
    overflow-x: auto;
    font-size: 15px;
}

/* Markdown Styles */
.text-content p { margin-bottom: 1em; }
.text-content p:last-child { margin-bottom: 0; }
.text-content pre { margin: 1em 0; border-radius: 6px; }
.text-content code:not(.hljs) {
    background-color: var(--border-color);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
}
.text-content ul, .text-content ol { margin: 0 0 1em 2em; }
.text-content a { color: var(--accent-color); }

.code-block-wrapper {
    background-color: var(--code-bg);
    border-radius: 6px;
    overflow: hidden;
    margin: 1em 0;
}

.code-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: #2f2f2f;
    font-size: 12px;
    color: var(--text-secondary);
}

.copy-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;
}

.copy-btn:hover {
    color: var(--text-primary);
}

/* Input Area */
.input-container {
    padding: 20px;
    background: linear-gradient(180deg, transparent, var(--bg-color) 40%);
}

.input-wrapper {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    background-color: var(--user-msg-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    align-items: flex-end;
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
}

#message-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 15px;
    resize: none;
    max-height: 200px;
    outline: none;
    padding-right: 40px;
    line-height: 1.5;
}

.send-btn {
    position: absolute;
    right: 12px;
    bottom: 12px;
    background-color: var(--accent-color);
    color: white;
    border-radius: 6px;
    width: 32px;
    height: 32px;
}

.send-btn:disabled {
    background-color: var(--border-color);
    color: #666;
    cursor: not-allowed;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-overlay.hidden {
    display: none;
}

.modal {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

.modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-body {
    padding: 20px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
}

.form-group input[type="text"] {
    width: 100%;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background-color: var(--user-msg-bg);
    color: var(--text-primary);
    font-family: inherit;
    outline: none;
}

.form-group input[type="text"]:focus {
    border-color: var(--accent-color);
}

.checkbox-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.modal-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
}

/* Typing Indicator */
.typing-indicator {
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: var(--text-secondary);
    border-radius: 50%;
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

/* Mobile Responsive */
.mobile-only {
    display: none;
}

@media (max-width: 768px) {
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
    }

    .sidebar.open {
        transform: translateX(0);
    }

    #menu-btn {
        display: block;
    }

    .mobile-only {
        display: block;
    }

    .message {
        padding: 16px 12px;
    }
}
