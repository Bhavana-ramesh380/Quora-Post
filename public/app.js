// Toast utility
function showToast(message, type = 'success') {
    const existing = document.getElementById('toast-container');
    const container = existing || Object.assign(document.createElement('div'), { id: 'toast-container' });
    if (!existing) {
        container.className = 'fixed top-4 right-4 space-y-2 z-50';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const base = 'px-4 py-2 rounded-md shadow text-sm';
    const cls = type === 'error' ? 'bg-red-700 text-white' : 'bg-red-700 text-white';
    toast.className = base + ' ' + cls;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
}

// Like button handler (delegated)
document.addEventListener('click', async (e) => {
    const likeBtn = e.target.closest('[data-like-btn]');
    const deleteBtn = e.target.closest('[data-delete-btn]');
    if (likeBtn) {
        e.preventDefault();
        const id = likeBtn.getAttribute('data-post-id');
        const counter = document.querySelector(`[data-like-count="${id}"]`);
        try {
            const res = await fetch(`/posts/${id}/like`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to like');
            const data = await res.json();
            if (counter) counter.textContent = data.likes;
        } catch (err) {
            showToast('Could not like the post', 'error');
        }
    } else if (deleteBtn) {
        const form = deleteBtn.closest('form');
        if (form) {
            const ok = confirm('Delete this post?');
            if (!ok) e.preventDefault();
        }
    }
});

// Markdown live preview (on new/edit pages when present)
function bindMarkdownPreview() {
    const textarea = document.querySelector('textarea[name="content"]');
    const preview = document.getElementById('md-preview');
    if (!textarea || !preview || typeof marked === 'undefined' || typeof DOMPurify === 'undefined') return;
    const render = () => {
        const raw = textarea.value || '';
        const html = marked.parse(raw, { breaks: true });
        preview.innerHTML = DOMPurify.sanitize(html);
    };
    textarea.addEventListener('input', render);
    render();
}

// Show toasts based on URL params
(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    if (success === 'created') showToast('Post created');
    if (success === 'updated') showToast('Post updated');
    if (success === 'deleted') showToast('Post deleted');
    bindMarkdownPreview();
})();

