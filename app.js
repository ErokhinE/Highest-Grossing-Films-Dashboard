async function fetchFilms() {
    try {
        const response = await fetch('films.json');
        const films = await response.json();
        initializeDashboard(films);
    } catch (error) {
        console.error('Error loading films:', error);
    }
}

function initializeDashboard(films) {
    updateStats(films);
    populateFilters(films);
    displayFilms(films);
}

function updateStats(films) {
    document.getElementById('total-films').textContent = films.length;
    const totalBoxOffice = films.reduce((sum, f) => sum + parseCurrency(f.box_office), 0);
    document.getElementById('avg-box-office').textContent = `$${Math.round(totalBoxOffice / films.length / 1e6)}M`;
    document.getElementById('newest-film').textContent = Math.max(...films.map(f => f.release_year));
}

function populateFilters(films) {
    const countrySet = new Set(films.map(f => f.country).filter(Boolean));
    const filterCountry = document.getElementById('filter-country');
    filterCountry.innerHTML += Array.from(countrySet).map(c => `<option value="${c}">${c}</option>`).join('');
}

function displayFilms(films) {
    const container = document.getElementById('films-container');
    container.innerHTML = films.map(f => `
        <div class="film-card">
            <div class="film-card-header">${f.title} <span class="film-year">${f.release_year}</span></div>
            <div class="film-content">
                <div class="film-director">Director: ${f.director || 'Unknown'}</div>
                <div class="film-country">Country: ${f.country || 'Unknown'}</div>
                <div class="film-box-office">Box Office: $${parseCurrency(f.box_office).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

function parseCurrency(str) {
    return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}
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


function filterAndDisplayFilms() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortOption = sortSelect.value;
    const countryValue = countryFilter.value;

    let filteredFilms = filmsData.filter(film => {
        const matchesSearch = film.title.toLowerCase().includes(searchTerm) || 
                              (film.director && film.director.toLowerCase().includes(searchTerm));

        const matchesCountry = !countryValue || (film.country && film.country.includes(countryValue));

        return matchesSearch && matchesCountry;
    });

    const sortingFunctions = {
        "box-office-desc": (a, b) => parseCurrency(b.box_office) - parseCurrency(a.box_office),
        "box-office-asc": (a, b) => parseCurrency(a.box_office) - parseCurrency(b.box_office),
        "year-desc": (a, b) => b.release_year - a.release_year,
        "year-asc": (a, b) => a.release_year - b.release_year,
        "title-asc": (a, b) => a.title.localeCompare(b.title),
        "title-desc": (a, b) => b.title.localeCompare(a.title)
    };

    if (sortingFunctions[sortOption]) {
        filteredFilms.sort(sortingFunctions[sortOption]);
    }

    totalFilmsEl.textContent = filteredFilms.length;

    const totalPages = Math.ceil(filteredFilms.length / filmsPerPage);
    currentPage = Math.min(currentPage, Math.max(1, totalPages));

    const startIndex = (currentPage - 1) * filmsPerPage;
    const endIndex = Math.min(startIndex + filmsPerPage, filteredFilms.length);
    const paginatedFilms = filteredFilms.slice(startIndex, endIndex);

    displayFilms(paginatedFilms);
    updatePagination(totalPages);
}


document.addEventListener('DOMContentLoaded', fetchFilms);
