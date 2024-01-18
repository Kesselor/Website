
window.addEventListener('load', function() {
    var loader = document.querySelector('.load-animation');
    var mainContent = document.querySelector('main');
    setTimeout(function() {
        loader.style.display = 'none';
        mainContent.style.opacity = 1; // Ensures the main content is visible after loading
    }, 2000); // Adjust time to match the duration of the load animation
});
