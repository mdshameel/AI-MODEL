/* ── AskAI · app.js (text-only) ── */

// ── Service Worker Registration ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/static/sw.js').catch(err => {
      console.warn('Service Worker registration failed:', err);
    });
  });
}

const chatContainer = document.getElementById('chatContainer');
const chatMessages  = document.getElementById('chatMessages');
const chatEmpty     = document.getElementById('chatEmpty');
const questionInput = document.getElementById('questionInput');
const sendBtn       = document.getElementById('sendBtn');
const clearChatBtn  = document.getElementById('clearChatBtn');
const toastContainer= document.getElementById('toastContainer');

// ── Auto-grow textarea ──────────────────────────────────────────────────
questionInput.addEventListener('input', () => {
  questionInput.style.height = 'auto';
  questionInput.style.height = Math.min(questionInput.scrollHeight, 160) + 'px';
});

// ── Enter to send ───────────────────────────────────────────────────────
questionInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submitQuestion();
  }
});

sendBtn.addEventListener('click', submitQuestion);

// ── Clear chat ──────────────────────────────────────────────────────────
clearChatBtn.addEventListener('click', () => {
  if (!chatMessages.children.length) return;
  chatMessages.innerHTML = '';
  chatEmpty.style.display = '';
  showToast('Conversation cleared', 'success');
});

// ── Suggestion chips ────────────────────────────────────────────────────
document.querySelectorAll('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    questionInput.value = chip.dataset.text;
    questionInput.style.height = 'auto';
    questionInput.style.height = Math.min(questionInput.scrollHeight, 160) + 'px';
    questionInput.focus();
  });
});

// ── Submit ───────────────────────────────────────────────────────────────
async function submitQuestion() {
  const question = questionInput.value.trim();
  if (!question) return;

  appendUserBubble(question);

  questionInput.value = '';
  questionInput.style.height = 'auto';

  const typingId = appendTyping();
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append('question', question);

    const res  = await fetch('/ask', { method: 'POST', body: formData });
    removeTyping(typingId);

    if (!res.ok) {
      appendAIBubble('Server error. Please try again.', true);
      showToast('Server returned an error.', 'error');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let aiMsgId = appendAIBubble(''); 
    let fullAnswer = '';
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      let newlineIdx;
      while ((newlineIdx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newlineIdx).trim();
        buffer = buffer.slice(newlineIdx + 1);
        
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') continue;
          try {
            const data = JSON.parse(dataStr);
            if (data.error) {
              updateAIBubble(aiMsgId, data.error, true);
              showToast(data.error, 'error');
              return;
            }
            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
              fullAnswer += data.choices[0].delta.content;
              updateAIBubble(aiMsgId, fullAnswer);
            }
          } catch (e) {
            console.warn("Error parsing JSON chunk:", dataStr);
          }
        }
      }
    }
  } catch (err) {
    removeTyping(typingId);
    if (!navigator.onLine || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      appendAIBubble('You appear to be offline. Please check your internet connection.', true);
      showToast('You are offline.', 'error');
    } else {
      appendAIBubble('Network error: ' + err.message, true);
      showToast('Network error. Check your connection.', 'error');
    }
  } finally {
    setLoading(false);
    questionInput.focus();
  }
}

// ── Bubble builders ──────────────────────────────────────────────────────
function hideChatEmpty() {
  if (chatEmpty.style.display !== 'none') chatEmpty.style.display = 'none';
}

function appendUserBubble(text) {
  hideChatEmpty();
  const msg = document.createElement('div');
  msg.className = 'msg msg-user';
  msg.innerHTML = `<div class="bubble">${escapeHtml(text)}</div><span class="msg-label">You</span>`;
  chatMessages.appendChild(msg);
  scrollToBottom();
}

function appendAIBubble(text, isError = false) {
  hideChatEmpty();
  const id = 'ai-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  const msg = document.createElement('div');
  msg.className = 'msg msg-ai';
  msg.id = id;
  msg.innerHTML = `
    <span class="msg-label">AskAI</span>
    <div class="bubble${isError ? ' error' : ''}">${formatAnswer(text)}</div>
  `;
  chatMessages.appendChild(msg);
  scrollToBottom();
  return id;
}

function updateAIBubble(id, text, isError = false) {
  const msg = document.getElementById(id);
  if (!msg) return;
  const bubble = msg.querySelector('.bubble');
  if (isError) bubble.classList.add('error');
  bubble.innerHTML = formatAnswer(text);
  scrollToBottom();
}

function appendTyping() {
  hideChatEmpty();
  const id  = 'typing-' + Date.now();
  const msg = document.createElement('div');
  msg.className = 'msg msg-ai';
  msg.id = id;
  msg.innerHTML = `
    <span class="msg-label">AskAI</span>
    <div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>
  `;
  chatMessages.appendChild(msg);
  scrollToBottom();
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ── Toast ─────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// ── Helpers ───────────────────────────────────────────────────────────────
function setLoading(on) {
  sendBtn.disabled = on;
  sendBtn.classList.toggle('loading', on);
}

function scrollToBottom() {
  requestAnimationFrame(() => { chatContainer.scrollTop = chatContainer.scrollHeight; });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/\n/g, '<br>');
}

function formatAnswer(text) {
  let safe = escapeHtml(text);
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/`(.+?)`/g, '<code>$1</code>');
  return safe;
}
