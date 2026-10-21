/* ─── API URL ─── */
const API_URL = '/api/notes';

/* ─── DOM Elements ─── */
const textarea = document.getElementById('note-textarea');
const saveBtn = document.getElementById('save-btn');
const charCounter = document.getElementById('char-counter');
const notesList = document.getElementById('notes-list');
const notesCount = document.getElementById('notes-count');
const toastContainer = document.getElementById('toast-container');

const MAX_CHARS = 2000;

/* ─── Character Counter ─── */
textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCounter.textContent = `${len} / ${MAX_CHARS}`;

    charCounter.classList.remove('warning', 'danger');
    if (len >= MAX_CHARS) {
        charCounter.classList.add('danger');
    } else if (len >= MAX_CHARS * 0.9) {
        charCounter.classList.add('warning');
    }
});

/* ─── Save Note ─── */
saveBtn.addEventListener('click', async () => {
    const content = textarea.value.trim();
    if (!content) {
        showToast('Please write something before saving!', 'error');
        return;
    }

    saveBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to save note');
        }

        const note = await response.json();
        showToast('Note saved successfully!', 'success');

        // Clear textarea
        textarea.value = '';
        charCounter.textContent = `0 / ${MAX_CHARS}`;
        charCounter.classList.remove('warning', 'danger');

        // Refresh notes
        await loadNotes();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        saveBtn.disabled = false;
    }
});

/* ─── Load Notes ─── */
async function loadNotes() {
    notesList.innerHTML = '<div class="notes-loading"><span class="spinner"></span>Loading notes...</div>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to load notes');

        const notes = await response.json();
        renderNotes(notes);
    } catch (err) {
        notesList.innerHTML = `
            <div class="empty-state">
                <p>Could not load notes</p>
                <span>${err.message}</span>
            </div>
        `;
        showToast(err.message, 'error');
    }
}

/* ─── Render Notes ─── */
function renderNotes(notes) {
    notesCount.textContent = `${notes.length} note${notes.length === 1 ? '' : 's'}`;

    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p>No notes yet</p>
                <span>Write your first note above!</span>
            </div>
        `;
        return;
    }

    notesList.innerHTML = notes.map(note => createNoteCard(note)).join('');
}

/* ─── Create Note Card HTML ─── */
function createNoteCard(note) {
    const timeAgo = formatRelativeTime(note.created_at);
    return `
        <div class="note-card">
            <div class="note-content">${escapeHtml(note.content)}</div>
            <div class="note-meta">
                <span class="note-time">${timeAgo}</span>
            </div>
        </div>
    `;
}

/* ─── Format Relative Time ─── */
function formatRelativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    });
}

/* ─── Escape HTML ─── */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ─── Toast Notification ─── */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Auto-remove after animation finishes
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3100);
}

/* ─── Initialize ─── */
loadNotes();
