document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const bugForm = document.getElementById('bug-form');
    const lists = {
        'Open': document.getElementById('list-open'),
        'In Progress': document.getElementById('list-progress'),
        'Closed': document.getElementById('list-closed')
    };
    const counts = {
        'Open': document.getElementById('count-open'),
        'In Progress': document.getElementById('count-progress'),
        'Closed': document.getElementById('count-closed')
    };
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');

    // Data State
    let bugs = JSON.parse(localStorage.getItem('bugTrackerData')) || [];

    // Initialize
    renderBugs();

    // Event Listeners
    bugForm.addEventListener('submit', handleAddBug);

    // --- Core Functions ---

    function handleAddBug(e) {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const priority = document.getElementById('priority').value;
        const assignee = document.getElementById('assignee').value || 'Unassigned';
        const description = document.getElementById('description').value;

        const newBug = {
            id: Date.now().toString(),
            title,
            priority,
            assignee,
            description,
            status: 'Open',
            createdAt: new Date().toLocaleDateString()
        };

        bugs.push(newBug);
        saveAndRender();
        bugForm.reset();
        showToast('Bug reported successfully!');
    }

    function deleteBug(id) {
        if(confirm('Are you sure you want to delete this bug?')) {
            bugs = bugs.filter(bug => bug.id !== id);
            saveAndRender();
            showToast('Bug deleted.');
        }
    }

    function updateBugStatus(id, newStatus) {
        const bug = bugs.find(b => b.id === id);
        if (bug) {
            bug.status = newStatus;
            saveAndRender();
        }
    }

    function saveAndRender() {
        localStorage.setItem('bugTrackerData', JSON.stringify(bugs));
        renderBugs();
    }

    function renderBugs() {
        // Clear lists
        Object.values(lists).forEach(list => list.innerHTML = '');
        
        // Reset counts
        const statusCounts = { 'Open': 0, 'In Progress': 0, 'Closed': 0 };

        bugs.forEach(bug => {
            const card = createBugCard(bug);
            if (lists[bug.status]) {
                lists[bug.status].appendChild(card);
                statusCounts[bug.status]++;
            }
        });

        // Update counts
        Object.keys(statusCounts).forEach(status => {
            if (counts[status]) {
                counts[status].textContent = statusCounts[status];
            }
        });
    }

    function createBugCard(bug) {
        const card = document.createElement('div');
        card.className = 'bug-card';
        card.setAttribute('draggable', true); // Future proofing for drag/drop
        
        // Priority Badge Class
        const priorityClass = `priority-${bug.priority}`;

        card.innerHTML = `
            <div class="bug-header">
                <span class="priority-badge ${priorityClass}">${bug.priority}</span>
                <div class="bug-actions">
                    <button class="btn-icon btn-delete" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            <h4 class="bug-title">${escapeHtml(bug.title)}</h4>
            <p class="bug-desc">${escapeHtml(bug.description)}</p>
            <div class="bug-meta">
                <div class="bug-assignee" title="Assignee">
                    <i class="fa-solid fa-user-circle"></i> ${escapeHtml(bug.assignee)}
                </div>
                <div class="bug-status-control">
                   <select class="status-select">
                        <option value="Open" ${bug.status === 'Open' ? 'selected' : ''}>Open</option>
                        <option value="In Progress" ${bug.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Closed" ${bug.status === 'Closed' ? 'selected' : ''}>Closed</option>
                   </select> 
                </div>
            </div>
        `;

        // Event Listeners for actions
        const deleteBtn = card.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => deleteBug(bug.id));

        const statusSelect = card.querySelector('.status-select');
        statusSelect.addEventListener('change', (e) => updateBugStatus(bug.id, e.target.value));

        return card;
    }

    // --- Utilities ---

    function showToast(message) {
        toastMsg.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
