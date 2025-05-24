let countdown = 5;
const countdownElement = document.getElementById('countdown');

const timer = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
        window.location.href = 'https://multix.cloud';
        clearInterval(timer);
    } else {
        countdownElement.textContent = countdown;
    }
}, 1000); 