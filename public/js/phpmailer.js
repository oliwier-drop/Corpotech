// Form submission handling with AJAX
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wysyłanie...';
        
        fetch('../send-email.php', {
            method: 'POST',
            body: formData
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Wystąpił błąd podczas wysyłania wiadomości.');
            }
            return data;
        })
        .then(data => {
            if (data.success) {
                alert('Dziękujemy za wysłanie wiadomości. Skontaktujemy się z Tobą wkrótce!');
                form.reset();
            } else {
                throw new Error(data.message || 'Wystąpił błąd podczas wysyłania wiadomości.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || 'Wystąpił błąd podczas wysyłania wiadomości.');
        })
        .finally(() => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
    });
});