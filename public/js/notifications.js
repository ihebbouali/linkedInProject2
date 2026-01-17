function showNotification(type, title, message) {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        'success': '<i class="bi bi-check-circle-fill notification-icon"></i>',
        'error': '<i class="bi bi-x-circle-fill notification-icon"></i>',
        'warning': '<i class="bi bi-exclamation-triangle-fill notification-icon"></i>',
        'info': '<i class="bi bi-info-circle-fill notification-icon"></i>'
    };
    
    notification.innerHTML = `
        ${icons[type] || icons['info']}
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="bi bi-x"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

window.showSuccess = (message) => showNotification('success', 'Succès', message);
window.showError = (message) => showNotification('error', 'Erreur', message);
window.showWarning = (message) => showNotification('warning', 'Attention', message);
window.showInfo = (message) => showNotification('info', 'Information', message);
