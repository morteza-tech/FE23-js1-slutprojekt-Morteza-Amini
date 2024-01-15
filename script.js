const API_KEY = '5d91ffd17adf2d317b92159b4d28e0e0';
const BASE_URL = 'https://api.themoviedb.org/3';

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}?&api_key=${API_KEY}`);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Obehörig åtkomst: Ogiltig API-nyckel. Kontrollera din API-nyckel och försök igen.');
            } else if (response.status === 404) {
                throw new Error('Resursen hittades inte: Kontrollera din förfrågan och försök igen.');
            } else {
                throw new Error(`Serverfel: ${response.status} - Något gick fel med API-anropet. Kontrollera din anslutning och försök igen.`);
            }
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        throw new Error(`Något gick fel: ${error.message}`);
    }
}

function displayMovies(movies, container) {
    container.innerHTML = '';
    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        
        const imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 'path/to/default/movie-image.jpg';
        
        movieItem.innerHTML = `
            <img src="${imageUrl}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release date: ${movie.release_date}</p>
            <p>${movie.overview}</p>
        `;
        container.appendChild(movieItem);
    });
}

function displayPeople(people, container) {
    container.innerHTML = '';
    people.forEach(person => {
        const personItem = document.createElement('div');
        
        const imageUrl = person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : 'path/to/default/person-image.jpg';
        
        personItem.innerHTML = `
            <img src="${imageUrl}" alt="${person.name}">
            <h3>${person.name}</h3>
            <p>Known for: ${person.known_for_department}</p>
            <ul>
               ${person.known_for.map(item => `<li>${item.media_type === 'movie' ? 'Movie' : 'TV'}: ${item.title || item.name}</li>`).join('')}
            </ul>
        `;
        container.appendChild(personItem);
    });
}

async function showTopRated() {
    try {
        const topRated = await fetchData('/movie/top_rated');
        displayMovies(topRated.slice(0, 10), document.getElementById('topRatedList'));
    } catch (error) {
        alert(`Det uppstod ett problem när topplistan skulle hämtas: ${error.message}`);
    }
}

async function showPopular() {
    try {
        const popular = await fetchData('/movie/popular');
        displayMovies(popular.slice(0, 10), document.getElementById('popularList'));
    } catch (error) {
        alert(`Det uppstod ett problem när populära filmer skulle hämtas: ${error.message}`);
    }
}

async function search() {
    try {
        const query = document.getElementById('searchInput').value;
        const results = await fetchData(`/search/multi?query=${query}`);
        
        if (!results.length) {
            throw new Error('Inga resultat hittades.');
        }
        
        displayResults(results);
    } catch (error) {
        if (error.message.includes('Obehörig åtkomst')) {
            alert(error.message);
        } else if (error.message.includes('Serverfel')) {
            alert('Något gick fel med API-anropet. Kontrollera din anslutning och försök igen.');
        } else if (error.message.includes('Resursen hittades inte')) {
            alert('Resursen hittades inte. Kontrollera din förfrågan och försök igen.');
        } else {
            //network error
            if (navigator.onLine) {
                alert(`Det uppstod ett problem: ${error.message}`);
            } else {
                alert('Nätverksfel. Kontrollera din internetanslutning och försök igen.');
            }
        }
    }
}

function displayResults(results) {
    const searchList = document.getElementById('searchList');
    searchList.innerHTML = '';

    if (results && results.length) {
        const movies = results.filter(item => item.media_type === 'movie');
        const people = results.filter(item => item.media_type === 'person');

        const container = document.createElement('div');
        container.classList.add('results-container');

        const peopleSection = document.createElement('div');
        peopleSection.classList.add('people-section');
        peopleSection.innerHTML = '<h2>Personer</h2>';
        people.forEach(person => {
            const personItem = document.createElement('div');
            
            const imageUrl = person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : 'path/to/default/person-image.jpg';
            personItem.innerHTML = `
                <img src="${imageUrl}" alt="${person.name}">
                <h3>${person.name}</h3>
                <p>Known for: ${person.known_for_department}</p>
                <ul>
                   ${person.known_for.map(item => `<li>${item.media_type === 'movie' ? 'Movie' : 'TV'}: ${item.title || item.name}</li>`).join('')}
                </ul>
            `;
            peopleSection.appendChild(personItem);
        });
        container.appendChild(peopleSection);

        const moviesSection = document.createElement('div');
        moviesSection.classList.add('movies-section');
        moviesSection.innerHTML = '<h2>Filmer</h2>';
        movies.forEach(movie => {
            const movieItem = document.createElement('div');
            
            const imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 'path/to/default/movie-image.jpg';
            movieItem.innerHTML = `
                <img src="${imageUrl}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>Release date: ${movie.release_date}</p>
                <p>${movie.overview}</p>
            `;
            moviesSection.appendChild(movieItem);
        });
        container.appendChild(moviesSection);

        searchList.appendChild(container);
    } else {
        searchList.innerHTML = '<p>Inga resultat hittades.</p>';
    }
}

$(document).ready(function() {
    $('#resetButton').click(function() {
        resetLists();
    });
    $('#searchInput').on('keydown', function(event) {
        if (event.which === 13) {
            search();
            event.preventDefault(); 
        }
    });
});

const resetLists = () => {
    $('#topRatedList, #popularList, #searchList').empty();
};
