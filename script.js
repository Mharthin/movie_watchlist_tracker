// Movie Watchlist App JavaScript

// Configuration
const STORAGE_KEY = 'movieWatchlist';

// State
let movies = [];
let selectedRating = 0;
let currentFilter = 'All';

// DOM Elements
const movieTitleInput = document.getElementById('movieTitle');
const movieStatusDropdown = document.getElementById('movieStatus');
const addMovieBtn = document.getElementById('addMovieBtn');
const moviesContainer = document.getElementById('moviesContainer');
const movieCountBadge = document.getElementById('movieCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const starRatingElements = document.querySelectorAll('.star');
const ratingDisplay = document.getElementById('ratingDisplay');
const countWant = document.getElementById('countWant');
const countWatching = document.getElementById('countWatching');
const countWatched = document.getElementById('countWatched');

// Event Listeners
addMovieBtn.addEventListener('click', addMovie);
movieTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addMovie();
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderMovies();
    });
});

starRatingElements.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.rating);
        updateStarDisplay();
    });
    
    star.addEventListener('mouseover', () => {
        const hoverRating = parseInt(star.dataset.rating);
        starRatingElements.forEach((s, index) => {
            if (index < hoverRating) {
                s.style.color = '#ffd700';
            } else {
                s.style.color = '#666';
            }
        });
    });
});

document.querySelector('.star-rating').addEventListener('mouseleave', updateStarDisplay);

// Add Movie Function
function addMovie() {
    const title = movieTitleInput.value.trim();
    const status = movieStatusDropdown.value;
    
    if (!title) {
        alert('Please enter a movie title');
        return;
    }
    
    const movie = {
        id: Date.now(),
        title,
        status,
        rating: selectedRating
    };
    
    movies.push(movie);
    saveToLocalStorage();
    
    // Reset form
    movieTitleInput.value = '';
    selectedRating = 0;
    updateStarDisplay();
    movieStatusDropdown.value = 'Want to Watch';
    
    updateMovieCount();
    updateStatusCounters();
    renderMovies();
    
    // Focus back to input
    movieTitleInput.focus();
}

// Delete Movie Function
function deleteMovie(id) {
    movies = movies.filter(movie => movie.id !== id);
    saveToLocalStorage();
    updateMovieCount();
    updateStatusCounters();
    renderMovies();
}

// Update Star Display
function updateStarDisplay() {
    starRatingElements.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    ratingDisplay.textContent = selectedRating > 0 ? `(${selectedRating} star${selectedRating !== 1 ? 's' : ''})` : '(0 stars)';
}

// Update Movie Count Badge
function updateMovieCount() {
    movieCountBadge.textContent = movies.length;
}

// Update Status Counters
function updateStatusCounters() {
    const wantCount = movies.filter(m => m.status === 'Want to Watch').length;
    const watchingCount = movies.filter(m => m.status === 'Watching').length;
    const watchedCount = movies.filter(m => m.status === 'Watched').length;
    
    countWant.textContent = wantCount;
    countWatching.textContent = watchingCount;
    countWatched.textContent = watchedCount;
}

// Render Movies
function renderMovies() {
    const filteredMovies = movies.filter(movie => {
        if (currentFilter === 'All') return true;
        return movie.status === currentFilter;
    });
    
    if (filteredMovies.length === 0) {
        moviesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎬</div>
                <p>${currentFilter === 'All' ? 'No movies yet. Add one to get started!' : `No movies with status "${currentFilter}"`}</p>
            </div>
        `;
        return;
    }
    
    moviesContainer.innerHTML = filteredMovies.map(movie => `
        <div class="movie-card">
            <div class="movie-card-header">
                <div class="movie-title">${escapeHtml(movie.title)}</div>
                <button class="btn-delete" onclick="deleteMovie(${movie.id})" title="Delete movie">✕</button>
            </div>
            <span class="movie-status status-${getStatusClass(movie.status)}">
                ${movie.status}
            </span>
            <div class="movie-rating">
                ${Array.from({ length: 5 }, (_, i) => 
                    `<span class="star ${i < movie.rating ? 'active' : ''}">★</span>`
                ).join('')}
            </div>
        </div>
    `).join('');
}

// LocalStorage Functions
function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            movies = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        movies = [];
    }
}

// Helper function to get status class
function getStatusClass(status) {
    if (status === 'Want to Watch') return 'want';
    if (status === 'Watching') return 'watching';
    if (status === 'Watched') return 'watched';
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateMovieCount();
    updateStatusCounters();
    renderMovies();
});
