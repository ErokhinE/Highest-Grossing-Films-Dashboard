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

document.addEventListener('DOMContentLoaded', fetchFilms);
