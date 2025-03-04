// DOM Elements
const addTaskForm = document.getElementById('addTaskForm');
const tasksList = document.getElementById('tasksList');
const taskCount = document.getElementById('taskCount');
const searchTask = document.getElementById('searchTask');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const editTaskModal = document.getElementById('editTaskModal');
const editTaskForm = document.getElementById('editTaskForm');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');
const themeToggle = document.getElementById('themeToggle');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadTheme();
});
addTaskForm.addEventListener('submit', addTask);
editTaskForm.addEventListener('submit', updateTask);
searchTask.addEventListener('input', filterTasks);
filterStatus.addEventListener('change', filterTasks);
filterPriority.addEventListener('change', filterTasks);
themeToggle.addEventListener('click', toggleTheme);

// Close modal events
document.querySelector('.close').addEventListener('click', closeModal);
document.getElementById('cancelEdit').addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === editTaskModal) {
        closeModal();
    }
});

// Functions
function loadTasks() {
    // Fetch tasks from server
    fetch('../api/tasks.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayTasks(data.tasks);
            } else {
                showNotification('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Tidak dapat terhubung ke server.', 'error');
        });
}

function displayTasks(tasks) {
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Belum ada tugas. Tambahkan tugas baru untuk memulai!</p>
            </div>
        `;
        taskCount.textContent = '(0)';
        return;
    }
    
    tasksList.innerHTML = '';
    taskCount.textContent = `(${tasks.length})`;
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'task-completed' : ''}`;
        taskElement.dataset.id = task.id;
        
        const formattedDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Tidak ada tenggat';
        
        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title">${escapeHTML(task.title)}</div>
                <div class="task-description">${escapeHTML(task.description || '')}</div>
                <div class="task-meta">
                    <span class="task-due-date">
                        <i class="far fa-calendar-alt"></i> ${formattedDate}
                    </span>
                    <span class="task-priority">
                        <i class="fas fa-flag"></i>
                        <span class="priority-badge priority-${task.priority}">${getPriorityLabel(task.priority)}</span>
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-action btn-edit" title="Edit tugas">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" title="Hapus tugas">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        tasksList.appendChild(taskElement);
        
        // Add event listeners to the elements
        taskElement.querySelector('.task-checkbox').addEventListener('change', toggleTaskStatus);
        taskElement.querySelector('.btn-edit').addEventListener('click', openEditModal);
        taskElement.querySelector('.btn-delete').addEventListener('click', deleteTask);
    });
}

function addTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    
    if (!title) {
        showNotification('Judul tugas tidak boleh kosong.', 'error');
        return;
    }
    
    const taskData = {
        title: title,
        description: description,
        priority: priority,
        due_date: dueDate || null
    };
    
    fetch('../api/tasks.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addTaskForm.reset();
            loadTasks();
            showNotification('Tugas berhasil ditambahkan!', 'success');
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Terjadi kesalahan saat menambahkan tugas.', 'error');
    });
}

function openEditModal(e) {
    const taskItem = e.target.closest('.task-item');
    const taskId = taskItem.dataset.id;
    
    // Mengambil data tugas dari server berdasarkan ID
    fetch(`../api/tasks.php?id=${taskId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.task) {
                document.getElementById('editTaskId').value = data.task.id;
                document.getElementById('editTaskTitle').value = data.task.title;
                document.getElementById('editTaskDescription').value = data.task.description || '';
                document.getElementById('editTaskPriority').value = data.task.priority;
                document.getElementById('editTaskDueDate').value = data.task.due_date || '';
                
                editTaskModal.style.display = 'block';
            } else {
                showNotification('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Terjadi kesalahan saat mengambil data tugas.', 'error');
        });
}

function closeModal() {
    editTaskModal.style.display = 'none';
}

function updateTask(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value.trim();
    const description = document.getElementById('editTaskDescription').value.trim();
    const priority = document.getElementById('editTaskPriority').value;
    const dueDate = document.getElementById('editTaskDueDate').value;
    
    if (!title) {
        showNotification('Judul tugas tidak boleh kosong.', 'error');
        return;
    }
    
    const taskData = {
        id: taskId,
        title: title,
        description: description,
        priority: priority,
        due_date: dueDate || null
    };
    
    fetch('../api/tasks.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal();
            loadTasks();
            showNotification('Tugas berhasil diperbarui!', 'success');
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Terjadi kesalahan saat memperbarui tugas.', 'error');
    });
}

function toggleTaskStatus(e) {
    const taskItem = e.target.closest('.task-item');
    const taskId = taskItem.dataset.id;
    const completed = e.target.checked;
    
    fetch('../api/tasks.php', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: taskId,
            completed: completed
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            taskItem.classList.toggle('task-completed', completed);
            showNotification(`Tugas ditandai sebagai ${completed ? 'selesai' : 'belum selesai'}.`, 'success');
        } else {
            // Revert the checkbox if failed
            e.target.checked = !completed;
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        e.target.checked = !completed;
        showNotification('Terjadi kesalahan saat memperbarui status tugas.', 'error');
    });
}

function deleteTask(e) {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
        return;
    }
    
    const taskItem = e.target.closest('.task-item');
    const taskId = taskItem.dataset.id;
    
    fetch(`../api/tasks.php?id=${taskId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            taskItem.remove();
            
            // Check if there are no more tasks
            if (tasksList.children.length === 0) {
                tasksList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>Belum ada tugas. Tambahkan tugas baru untuk memulai!</p>
                    </div>
                `;
            }
            
            taskCount.textContent = `(${tasksList.querySelectorAll('.task-item').length})`;
            showNotification('Tugas berhasil dihapus!', 'success');
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Terjadi kesalahan saat menghapus tugas.', 'error');
    });
}

function filterTasks() {
    const searchText = searchTask.value.toLowerCase();
    const statusFilter = filterStatus.value;
    const priorityFilter = filterPriority.value;
    
    const taskItems = document.querySelectorAll('.task-item');
    let visibleCount = 0;
    
    taskItems.forEach(task => {
        const title = task.querySelector('.task-title').textContent.toLowerCase();
        const description = task.querySelector('.task-description').textContent.toLowerCase();
        const priorityBadge = task.querySelector('.priority-badge');
        const isCompleted = task.classList.contains('task-completed');
        const priority = priorityBadge.className.includes('priority-high') ? 'high' : 
                        priorityBadge.className.includes('priority-medium') ? 'medium' : 'low';
        
        // Check if the task matches all filters
        const matchesSearch = title.includes(searchText) || description.includes(searchText);
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && !isCompleted) || 
                            (statusFilter === 'completed' && isCompleted);
        const matchesPriority = priorityFilter === 'all' || priority === priorityFilter;
        
        const isVisible = matchesSearch && matchesStatus && matchesPriority;
        task.style.display = isVisible ? 'grid' : 'none';
        
        if (isVisible) visibleCount++;
    });
    
    // Show empty state if no tasks match filters
    if (visibleCount === 0 && taskItems.length > 0) {
        // Only if we have tasks but none are visible due to filters
        const currentEmptyState = tasksList.querySelector('.empty-filter-state');
        
        if (!currentEmptyState) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state empty-filter-state';
            emptyState.innerHTML = `
                <i class="fas fa-filter"></i>
                <p>Tidak ada tugas yang sesuai dengan filter Anda.</p>
            `;
            
            // Append as the last child
            tasksList.appendChild(emptyState);
        }
    } else {
        // Remove empty filter state if tasks are visible
        const emptyFilterState = tasksList.querySelector('.empty-filter-state');
        if (emptyFilterState) {
            emptyFilterState.remove();
        }
    }
    
    taskCount.textContent = `(${visibleCount}/${taskItems.length})`;
}

function showNotification(message, type = 'info') {
    notificationMessage.textContent = message;
    
    // Set color based on type
    if (type === 'error') {
        notification.style.backgroundColor = 'rgba(244, 67, 54, 0.9)';
    } else if (type === 'success') {
        notification.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
    } else {
        notification.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
    }
    
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Helper functions
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getPriorityLabel(priority) {
    switch(priority) {
        case 'high': return 'Tinggi';
        case 'medium': return 'Sedang';
        case 'low': return 'Rendah';
        default: return 'Sedang';
    }
}

// Theme functions
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Tambahkan kelas transisi sebelum mengubah tema
    document.documentElement.classList.add('theme-transition');
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Hapus kelas transisi setelah animasi selesai
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 500);
    
    showNotification(`Mode ${newTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'info');
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}