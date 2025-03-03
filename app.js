const filmsContainer = document.getElementById('films-container');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const countryFilter = document.getElementById('filter-country');
const paginationEl = document.getElementById('pagination');

// Dashboard statistics elements
const totalFilmsEl = document.getElementById('total-films');
const avgBoxOfficeEl = document.getElementById('avg-box-office');
const newestFilmEl = document.getElementById('newest-film');
const topDirectorEl = document.getElementById('top-director');

// Pagination settings
let currentPage = 1;
const filmsPerPage = 6;

// Initialize the dashboard
function initDashboard() {
    // Populate country filter dropdown
    const countries = new Set();
    filmsData.forEach(film => {
        if (film.country) {
            film.country.split(', ').forEach(country => {
                countries.add(country.trim());
            });
        }
    });
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
    
    // Set up event listeners
    searchInput.addEventListener('input', filterAndDisplayFilms);
    sortSelect.addEventListener('change', filterAndDisplayFilms);
    countryFilter.addEventListener('change', filterAndDisplayFilms);
    
    // Initial display
    filterAndDisplayFilms();
    updateDashboardStats();
}

// Format currency
function formatCurrency(str) {
    if (!str) return '$0';
    
    // Handle strings that already have $ in them
    if (str.includes('$')) {
        return str;
    }
    
    // Try to convert to number
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return !isNaN(num) ? '$' + num.toLocaleString() : str;
}

// Parse currency string to number
function parseCurrency(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}

// Filter, sort, and display films
function filterAndDisplayFilms() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortOption = sortSelect.value;
    const countryValue = countryFilter.value;
    
    // Filter films
    let filteredFilms = filmsData.filter(film => {
        const matchesSearch = film.title.toLowerCase().includes(searchTerm) || 
                            (film.director && film.director.toLowerCase().includes(searchTerm));
        
        const matchesCountry = !countryValue || 
                            (film.country && film.country.includes(countryValue));
        
        return matchesSearch && matchesCountry;
    });
    
    // Sort films
    switch(sortOption) {
        case 'box-office-desc':
            filteredFilms.sort((a, b) => parseCurrency(b.box_office) - parseCurrency(a.box_office));
            break;
        case 'box-office-asc':
            filteredFilms.sort((a, b) => parseCurrency(a.box_office) - parseCurrency(b.box_office));
            break;
        case 'year-desc':
            filteredFilms.sort((a, b) => b.release_year - a.release_year);
            break;
        case 'year-asc':
            filteredFilms.sort((a, b) => a.release_year - b.release_year);
            break;
        case 'title-asc':
            filteredFilms.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            filteredFilms.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    
    // Update total count
    totalFilmsEl.textContent = filteredFilms.length;
    
    // Handle pagination
    const totalPages = Math.ceil(filteredFilms.length / filmsPerPage);
    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }
    
    const startIndex = (currentPage - 1) * filmsPerPage;
    const endIndex = Math.min(startIndex + filmsPerPage, filteredFilms.length);
    const paginatedFilms = filteredFilms.slice(startIndex, endIndex);
    
    // Display films
    displayFilms(paginatedFilms);
    
    // Update pagination
    updatePagination(totalPages);
}

// Display films in the grid
function displayFilms(films) {
    filmsContainer.innerHTML = '';
    
    if (films.length === 0) {
        filmsContainer.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <h3>No films found matching your criteria</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    films.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.className = 'film-card';
        
        filmCard.innerHTML = `
            <div class="film-card-header">
                ${film.title}
                <span class="film-year">${film.release_year}</span>
            </div>
            <div class="film-content">
                <div class="film-director">Director: ${film.director || 'Unknown'}</div>
                <div class="film-country">Country: ${film.country || 'Unknown'}</div>
                <div class="film-box-office">Box Office: ${formatCurrency(film.box_office)}</div>
            </div>
        `;
        
        filmsContainer.appendChild(filmCard);
    });
}

// Update pagination controls
function updatePagination(totalPages) {
    paginationEl.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = '←';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            filterAndDisplayFilms();
        }
    });
    paginationEl.appendChild(prevButton);
    
    // Page buttons
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'active' : '';
        pageButton.addEventListener('click', () => {
            currentPage = i;
            filterAndDisplayFilms();
        });
        paginationEl.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = '→';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            filterAndDisplayFilms();
        }
    });
    paginationEl.appendChild(nextButton);
}

// Update dashboard statistics
function updateDashboardStats() {
    // Total films
    totalFilmsEl.textContent = filmsData.length;
    
    // Average box office
    const totalBoxOffice = filmsData.reduce((sum, film) => sum + parseCurrency(film.box_office), 0);
    const avgBoxOffice = totalBoxOffice / filmsData.length;
    avgBoxOfficeEl.textContent = '$' + Math.round(avgBoxOffice / 1000000) + 'M';
    
    // Newest film
    const newestYear = Math.max(...filmsData.map(film => film.release_year));
    newestFilmEl.textContent = newestYear;
    
    // Top director (most films in the list)
    const directorCounts = {};
    filmsData.forEach(film => {
        if (film.director) {
            directorCounts[film.director] = (directorCounts[film.director] || 0) + 1;
        }
    });
    
    let topDirector = '';
    let maxCount = 0;
    
    for (const director in directorCounts) {
        if (directorCounts[director] > maxCount) {
            maxCount = directorCounts[director];
            topDirector = director;
        }
    }
    
    // Display first name if director name is too long
    if (topDirector.includes(' ') && topDirector.length > 10) {
        topDirector = topDirector.split(' ')[0];
    }
    
    topDirectorEl.textContent = topDirector;
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initDashboard);
