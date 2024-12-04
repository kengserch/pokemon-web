let currentPage = 1;
let allPokemonData = [];
let filteredPokemonData = [];

document.getElementById('prev-btn').addEventListener('click', () => changePage(-1));
document.getElementById('next-btn').addEventListener('click', () => changePage(1));

async function initializePage() {
    await fetchPokemon();
    renderPokemonPage();
}

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

async function fetchPokemon() {
    const loader = document.querySelector('.js-loader');
    loader.classList.remove('hidden');
    const grid = document.querySelector('.js-pokemon-grid');
    grid.classList.add('hidden');

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=200`);
        if (!response.ok) throw new Error('Failed to fetch Pokémon list');
        const data = await response.json();

        // ดึงข้อมูลเพิ่มเติมในเบื้องหลัง (background)
        const promises = data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            return res.json();
        });

        const pokemonData = await Promise.all(promises);
        allPokemonData = pokemonData;
        filteredPokemonData = allPokemonData;

        //console.log(filteredPokemonData)
    } catch (error) {
        console.log(error);
    } finally {
        loader.classList.add('hidden');
        grid.classList.remove('hidden');
        renderPokemonPage();
    }
}

async function changePage(direction) {
    const loader = document.querySelector('.js-loader');
    loader.classList.remove('hidden'); // แสดง loader ก่อน
    const grid = document.querySelector('.js-pokemon-grid');
    grid.classList.add('hidden'); // ซ่อน grid ขณะที่กำลังโหลด

    currentPage += direction;
    renderPokemonPage();

    await new Promise((resolve) => setTimeout(resolve, 200));
    loader.classList.add('hidden');
    grid.classList.remove('hidden');
}

//render
function renderPokemonPage() {
    const limit = 12;
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const pokemonToDisplay = filteredPokemonData.slice(startIndex, endIndex);

    if (pokemonToDisplay.length === 0) {
        document.querySelector('.js-pokemon-notfound').innerHTML = `
            <div class="text-center text-gray-500">
                <h1 class="text-5xl">No Pokémon found. Try searching again.</h1>
            </div>`;
        document.querySelector('.js-pokemon-grid').classList.add('hidden');
        document.querySelector('.js-pokemon-notfound').classList.remove('hidden');

        // ปิดปุ่ม Next/Previous ถ้าไม่มีผลลัพธ์
        document.getElementById('prev-btn').disabled = true;
        document.getElementById('next-btn').disabled = true;
        return; // จบการทำงานของฟังก์ชันนี้
    }

    document.querySelector('.js-pokemon-notfound').classList.add('hidden');

    renderPokemon(pokemonToDisplay);

    // อัปเดตปุ่ม Next/Previous
    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = endIndex >= filteredPokemonData.length;
}

function renderPokemon(pokemonData) {
    let pokemonDisplay = '';
    document.querySelector('.js-pokemon-grid').classList.remove('hidden');
    if (!Array.isArray(pokemonData)) {
        pokemonData = [pokemonData]; // แปลง object เดี่ยวให้เป็นอาร์เรย์
        //console.log(typeof pokemonData)
        document.getElementById('prev-btn').disabled = true;
        document.getElementById('next-btn').disabled = true;
    }

    //console.log(pokemonData)

    pokemonData.forEach((pokemon, index) => {
        //console.log(pokemon)
        const firstType = pokemon.types[0]?.type.name || '-';
        const secondType = pokemon.types[1]?.type.name || null;
        const firstBadgeClass = getTypeBadgeClass(firstType);
        const secondBadgeClass = secondType ? getTypeBadgeClass(secondType) : '';

        pokemonDisplay += `<div class="card bg-slate-700 w-full drop-shadow-lg transition ease-in-out delay-75 hover:drop-shadow-xl hover:-translate-y-6 cursor-pointer duration-300 js-card" data-pokemon-id="${index}"> 
                        <div class="flex items-center justify-center w-full h-[10rem]">
                            <img width="80px" height="80px" src="${pokemon.sprites.other.dream_world.front_default}" alt="${pokemon.name}" loading="lazy"/>
                        </div>
                        <div class="card-body">
                            <h2 class="card-title text-2xl">
                                ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                            </h2>
                            <div class="card-actions justify-end ">
                                <div class="badge h-auto text-white font-semibold text-lg bg-transparent border-2  ${firstBadgeClass}">${firstType}</div>
                                ${secondType ? `<div class="badge h-auto text-white font-semibold text-lg bg-transparent border-2  ${secondBadgeClass}">${secondType}</div>` : ''}
                            </div>
                        </div>
            </div>`;
    });

    const grid = document.querySelector('.js-pokemon-grid');
    grid.innerHTML = pokemonDisplay;

    grid.addEventListener('click', (event) => {
        const card = event.target.closest('.js-card');
        //console.log(card.dataset.pokemonId)
        if (card) {
            const index = card.dataset.pokemonId;
            openModal(index);
        }
    });
}
//end render

//search function
const searchInput = document.querySelector('.js-search-input');
const searchBtn = document.querySelector('.js-search-btn');

async function handleSearch() {
    const pokemon = searchInput.value.trim();
    if (pokemon) {
        await searchPokemon(pokemon);
    } else {
        filteredPokemonData = allPokemonData;
        renderPokemonPage();
    }
}

searchBtn.addEventListener('click', (event) => {
    event.preventDefault();
    handleSearch();
});

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
    }
});

searchInput.addEventListener('input', async () => {
    if (searchInput.value.trim() === '') {
        filteredPokemonData = allPokemonData;
        renderPokemonPage();
    }
});

async function searchPokemon(query) {
    const loader = document.querySelector('.js-loader');
    loader.classList.remove('hidden');
    const grid = document.querySelector('.js-pokemon-grid');
    grid.classList.add('hidden');

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
        if (!response.ok) throw new Error('Failed to fetch Pokémon list');
        const pokemon = await response.json();
        console.log(pokemon);
        console.log(typeof pokemon);
        filteredPokemonData = [pokemon];
        console.log(filteredPokemonData);
        console.log(typeof pokemon);
    } catch (error) {
        filteredPokemonData = [];
    } finally {
        loader.classList.add('hidden');
        grid.classList.remove('hidden');
        renderPokemonPage();
    }
}
//end search function

//filter by type
function filterByType(type) {
    const loader = document.querySelector('.js-loader');
    loader.classList.remove('hidden');
    const grid = document.querySelector('.js-pokemon-grid');
    grid.classList.add('hidden');

    filteredPokemonData = allPokemonData.filter((pokemon) => pokemon.types.some((t) => t.type.name === type));

    if (filteredPokemonData.length === 0) {
        document.querySelector('.js-pokemon-notfound').innerHTML = `
            <div class="text-center text-gray-500">
                <h1 class="text-5xl">No Pokémon found. Try searching again.</h1>
            </div>`;
        document.querySelector('.js-pokemon-grid').classList.add('hidden');
        document.querySelector('.js-pokemon-notfound').classList.remove('hidden');

        document.getElementById('prev-btn').disabled = true;
        document.getElementById('next-btn').disabled = true;
        setTimeout(() => {
            loader.classList.add('hidden');
            grid.classList.add('hidden');
        }, 200);
        return;
    }

    currentPage = 1;
    renderPokemonPage();

    setTimeout(() => {
        loader.classList.add('hidden');
        grid.classList.remove('hidden');
    }, 200);
}
const types = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
const container = document.querySelector('.types-container');

types.forEach((type) => {
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline', 'btn-xs');
    button.style.color = 'white';
    button.style.borderColor = getProgressColor(type);
    //button.classList.add(`${getTypeBadgeClass(type)}`)
    button.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    container.appendChild(button);

    button.addEventListener('mouseover', () => {
        if (!button.classList.contains('btn-active')) {
            button.style.color = '#ffffff';
            button.style.backgroundColor = getProgressColor(type);
        }
    });
    button.addEventListener('mouseout', () => {
        if (!button.classList.contains('btn-active')) {
            button.style.backgroundColor = 'transparent';
        }
    });

    button.addEventListener('click', () => {
        const isActive = button.classList.contains('btn-active');

        //console.log('First State Click:', button.classList.contains('btn-active'))

        document.querySelectorAll('.btn-outline').forEach((btn) => {
            btn.classList.remove('btn-active');
            btn.style.backgroundColor = 'transparent';
        });

        if (isActive) {
            filteredPokemonData = allPokemonData;
            renderPokemonPage();
            //console.log('Un select type click:', button.classList.contains('btn-active'))
        } else {
            button.style.backgroundColor = getProgressColor(type);
            button.style.color = 'white';
            //console.log('Select type click:', button.classList.contains('btn-active'))
            button.classList.add('btn-active');
            //console.log('After Select type click:', button.classList.contains('btn-active'))
            filterByType(type);
        }
    });
});
//end filter by type

//open detail pokemon with modal
function openModal(index) {
    const pokemon = filteredPokemonData[index];
    //console.log(pokemon)
    const firstType = pokemon.types[0]?.type.name || '-';
    const secondType = pokemon.types[1]?.type.name || null;
    const firstBadgeClass = getTypeBadgeClass(firstType);
    const secondBadgeClass = secondType ? getTypeBadgeClass(secondType) : '';

    document.getElementById('pokemon-modal').innerHTML = `<div class="modal-content bg-slate-700 rounded-lg mx-5 p-6 max-w-md lg:max-w-lg w-full h-auto relative">
                        <button id="modal-close" class=" text-red-600 top-4 right-4 absolute text-xl font-bold">❌</button>
                        <div class="flex flex-col items-center justify-center">
                            <img class="w-[100px] lg:w-[150px]" height="auto" src="${pokemon.sprites.other.dream_world.front_default}" alt="${pokemon.name}" loading="lazy"/>
                            <h2 id="modal-title" class="text-xl text-white font-bold mb-4">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                        </div>
                        <div class="card-actions justify-center ">
                                <div class="badge h-auto text-white font-semibold text-lg bg-transparent border-2  ${firstBadgeClass}">${firstType}</div>
                                ${secondType ? `<div class="badge h-auto text-white font-semibold text-lg bg-transparent border-2  ${secondBadgeClass}">${secondType}</div>` : ''}
                            </div>
                        <div id="modal-body">
                        </div>
                    </div>`;

    const statsHtml = pokemon.stats
        .map(
            (stat) =>
                `
        <div class="flex justify-between flex-col lg:flex-row mt-4 items-center text-white">
            <span class="font-bold">${stat.stat.name.toUpperCase()} (${stat.base_stat}) </span>
            <progress id="myProgress" class="progress bg-slate-100 w-56" value="${stat.base_stat}" max="100" style="--progress-value-color: ${getProgressColor(firstType)};"></progress>
        </div>
    `
        )
        .join('');

    document.getElementById('modal-body').innerHTML = statsHtml;

    const modal = document.getElementById('pokemon-modal');
    modal.classList.remove('hidden');

    const modalContent = document.querySelector('.modal-content');
    modalContent.addEventListener('click', (event) => event.stopPropagation());

    modal.addEventListener('click', closeModal);
    document.getElementById('modal-close').addEventListener('click', closeModal);
}
//close modal
function closeModal() {
    const modal = document.getElementById('pokemon-modal');
    const modalContent = document.querySelector('.modal-content');
    modalContent.classList.add('fadeOut');

    setTimeout(() => {
        modal.classList.add('hidden');
        modalContent.classList.remove('fadeOut');
    }, 200);
}

function getTypeBadgeClass(type) {
    const typeColors = {
        normal: 'border-gray-400',
        fire: 'border-red-500',
        water: 'border-blue-500',
        grass: 'border-green-500',
        electric: 'border-yellow-400',
        ice: 'border-cyan-400',
        fighting: 'border-red-700',
        poison: 'border-purple-500',
        ground: 'border-yellow-600',
        flying: 'border-blue-300',
        psychic: 'border-pink-500',
        bug: 'border-lime-400',
        rock: 'border-gray-600',
        ghost: 'border-indigo-500',
        dragon: 'border-purple-700',
        dark: 'border-gray-800',
        steel: 'border-gray-300',
        fairy: 'border-pink-300',
    };
    return typeColors[type] || 'bg-gray-200'; // สีเริ่มต้นหากไม่เจอ type
}

function getProgressColor(type) {
    const typeColors = {
        normal: '#9ca3af',
        fire: '#ef4444',
        water: '#6390f0',
        grass: '#22c55e',
        electric: '#f7d02c',
        ice: '#22d3ee',
        fighting: '#c22e28',
        poison: '#a33ea1',
        ground: '#ca8a04',
        flying: '#93c5fd',
        psychic: '#ec4899',
        bug: '#a3e635',
        rock: '#4b5563',
        ghost: '#6366f1',
        dragon: '#7e22ce',
        dark: '#1f2937',
        steel: '#d1d5db',
        fairy: '#f9a8d4',
    };
    return typeColors[type] || '#d3d3d3';
}
