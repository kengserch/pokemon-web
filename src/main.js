let currentPage = 1
let pokemonData = []

document.getElementById('prev-btn').addEventListener('click', () => changePage(-1))
document.getElementById('next-btn').addEventListener('click', () => changePage(1))

function changePage(direction) {
    currentPage += direction
    fetchPokemon(currentPage)
}

async function fetchPokemon(page) {
    const limit = 12
    const offset = (page - 1) * limit
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
        if (!response.ok) throw new Error('Failed to fetch Pokémon list')
        const data = await response.json()
        //console.log(data)
        // const promises = data.results.map((pokemon) => fetch(pokemon.url).then((res) => res.json()))
        const promises = data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url)
            return res.json()
        })
        //console.log(promises)
        pokemonData = await Promise.all(promises);
        //console.log(typeof pokemonData)
        renderPokemon()

        document.getElementById('prev-btn').disabled = page === 1
        document.getElementById('next-btn').disabled = pokemonData.length < limit
    } catch (error) {
        console.log(error)
    }
}

const searchInput = document.querySelector('.js-search-input')
const searchBtn = document.querySelector('.js-search-btn')

async function handleSearch() {
    const pokemon = searchInput.value.trim()
    if (pokemon) {
        await searchPokemon(pokemon)
    } else {
        await fetchPokemon()
    }
}

searchBtn.addEventListener('click', (event) => {
    event.preventDefault()
    handleSearch()
})

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        handleSearch()
    }
})

searchInput.addEventListener('input', async () => {
    if (searchInput.value.trim() === '') {
        await fetchPokemon() // โหลด Pokémon ทั้งหมดอีกครั้งเมื่อ input ว่าง
    }
})

async function searchPokemon(query) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`)
        if (!response.ok) throw new Error('Failed to fetch Pokémon list')
        const data = await response.json()
        renderPokemon(data)
    } catch (error) {
        console.log(error)
    }
}

function renderPokemon() {
    let pokemonDisplay = ''

    if (!Array.isArray(pokemonData)) {
        pokemonData = [pokemonData] // แปลง object เดี่ยวให้เป็นอาร์เรย์
        //console.log(typeof pokemonData)
        document.getElementById('prev-btn').disabled = true
        document.getElementById('next-btn').disabled = true
    }

    console.log(pokemonData)

    pokemonData.forEach((pokemon,index) => {
        const firstType = pokemon.types[0]?.type.name || '-'
        const secondType = pokemon.types[1]?.type.name || null
        const firstBadgeClass = getTypeBadgeClass(firstType)
        const secondBadgeClass = secondType ? getTypeBadgeClass(secondType) : ''
        //transition-all duration-150 ease-out hover:bg-gradient-to-r from-cyan-500 to-blue-500
        pokemonDisplay += `<div class="card bg-slate-700 w-full drop-shadow-lg transition ease-in-out delay-75 hover:drop-shadow-xl hover:-translate-y-6 cursor-pointer duration-300 js-card" data-pokemon-id="${index}"> 
                        <div class="flex items-center justify-center w-full h-[10rem]">
                            <img width="100px" height="auto" src="${pokemon.sprites.other.dream_world.front_default}"/>
                        </div>
                        <div class="card-body">
                            <h2 class="card-title text-2xl">
                                ${pokemon.name.charAt(0).toUpperCase()
                                    + pokemon.name.slice(1)}
                            </h2>
                            <div class="card-actions justify-end ">
                                <div class="badge h-auto text-white text-lg border-none ${firstBadgeClass}">${firstType}</div>
                                ${secondType ? 
                                    `<div class="badge h-auto text-white text-lg border-none ${secondBadgeClass}">${secondType}</div>` 
                                : ''}
                            </div>
                        </div>
            </div>`
    })

    const grid = document.querySelector('.js-pokemon-grid')
    grid.innerHTML = pokemonDisplay

    grid.addEventListener('click', (event) => {
        const card = event.target.closest('.js-card');
        //console.log(card.dataset.pokemonId)
        if (card) {
            const index = card.dataset.pokemonId 
            openModal(index)
        }
    });
    
}

function openModal(index) {
    const pokemon = pokemonData[index]; 
    console.log(pokemon);
    
    

    document.getElementById('pokemon-modal').innerHTML = `<div class="modal-content bg-white rounded-lg p-6 max-w-md w-full h-auto relative">
                    <button id="modal-close" class="modal-close text-gray-500 top-4 right-4 absolute" onclick="${closeModal()}">✖</button>
                    <h2 id="modal-title" class="text-xl text-black font-bold mb-4">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                    <div id="modal-body">
                        <!-- Details will be injected here -->
                    </div>
    </div>`


    

    const statsHtml = pokemon.stats.map(stat => `
        <div class="flex justify-between text-black">
            <span>${stat.stat.name.toUpperCase()}</span>
            <span>${stat.base_stat}</span>
        </div>
    `).join('');

    document.getElementById('modal-body').innerHTML = statsHtml;

    
    document.getElementById('pokemon-modal').classList.remove('hidden'); 


    document.getElementById('modal-close').addEventListener('click', closeModal);
    
}

function closeModal() {
    document.getElementById('pokemon-modal').classList.add('hidden');
}



function getTypeBadgeClass(type) {
    const typeColors = {
        normal: 'bg-gray-400',
        fire: 'bg-red-500',
        water: 'bg-blue-500',
        grass: 'bg-green-500',
        electric: 'bg-yellow-400',
        ice: 'bg-cyan-400',
        fighting: 'bg-red-700',
        poison: 'bg-purple-500',
        ground: 'bg-yellow-600',
        flying: 'bg-blue-300',
        psychic: 'bg-pink-500',
        bug: 'bg-green-700',
        rock: 'bg-gray-600',
        ghost: 'bg-indigo-500',
        dragon: 'bg-purple-700',
        dark: 'bg-gray-800',
        steel: 'bg-gray-300',
        fairy: 'bg-pink-300',
    }
    return typeColors[type] || 'bg-gray-200' // สีเริ่มต้นหากไม่เจอ type
}

fetchPokemon(currentPage)
