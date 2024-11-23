let currentPage = 1
let pokemonData 
let allPokemonData = []


document.getElementById('prev-btn').addEventListener('click', () => changePage(-1))
document.getElementById('next-btn').addEventListener('click', () => changePage(1))

fetchPokemon(1)

// async function initializePage() {
//     await fetchPokemon(1)
//     renderPokemon()
// }

// document.addEventListener('DOMContentLoaded', () => {
//     initializePage()
// })

async function changePage(direction) {
    currentPage += direction
    await fetchPokemon(currentPage)
}

async function fetchPokemon(page) {
    const limit = 12
    const offset = (page - 1) * limit

    const loader = document.querySelector('.js-loader')
    loader.classList.remove('hidden')
    const grid = document.querySelector('.js-pokemon-grid')
    grid.classList.add('hidden')

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
        pokemonData = await Promise.all(promises)
        //console.log(typeof pokemonData)
        console.log
        document.getElementById('prev-btn').disabled = page === 1
        document.getElementById('next-btn').disabled = pokemonData.length < limit
        //console.log(page)
    } catch (error) {
        console.log(error)
    } finally {
        await new Promise((resolve) => setTimeout(resolve, 300))
        loader.classList.add('hidden')
        grid.classList.remove('hidden')
        renderPokemon()
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

    const loader = document.querySelector('.js-loader')
    loader.classList.remove('hidden')
    const grid = document.querySelector('.js-pokemon-grid')
    grid.classList.add('hidden')

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`)
        if (!response.ok) throw new Error('Failed to fetch Pokémon list')
        const data = await response.json()
        pokemonData = data
    } catch (error) {
        alert('Pokemon not found!')
    }finally {
        await new Promise((resolve) => setTimeout(resolve, 300))
        loader.classList.add('hidden')
        grid.classList.remove('hidden')
        renderPokemon()
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

    //console.log(pokemonData)

    pokemonData.forEach((pokemon, index) => {
        //console.log(pokemon)
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
                                ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                            </h2>
                            <div class="card-actions justify-end ">
                                <div class="badge h-auto text-white text-lg border-none ${firstBadgeClass}">${firstType}</div>
                                ${secondType ? `<div class="badge h-auto text-white text-lg border-none ${secondBadgeClass}">${secondType}</div>` : ''}
                            </div>
                        </div>
            </div>`
    })

    const grid = document.querySelector('.js-pokemon-grid')
    grid.innerHTML = pokemonDisplay

    grid.addEventListener('click', (event) => {
        const card = event.target.closest('.js-card')
        //console.log(card.dataset.pokemonId)
        if (card) {
            const index = card.dataset.pokemonId
            openModal(index)
        }
    })
}

function openModal(index) {
    const pokemon = pokemonData[index]
    //console.log(pokemon)
    const firstType = pokemon.types[0]?.type.name || '-'
    const secondType = pokemon.types[1]?.type.name || null
    const firstBadgeClass = getTypeBadgeClass(firstType)
    const secondBadgeClass = secondType ? getTypeBadgeClass(secondType) : ''

    document.getElementById('pokemon-modal').innerHTML = `<div class="modal-content bg-white rounded-lg mx-5 p-6 max-w-md lg:max-w-lg w-full h-auto relative">
                        <button id="modal-close" class=" text-black top-4 right-4 absolute text-xl font-bold">❌</button>
                        <div class="flex flex-col items-center justify-center">
                            <img class="w-[150px] lg:w-[200px]" height="auto" src="${pokemon.sprites.other.dream_world.front_default}"/>
                            <h2 id="modal-title" class="text-xl text-black font-bold mb-4">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                        </div>
                        <div class="card-actions justify-center ">
                                <div class="badge h-auto text-white text-lg border-none ${firstBadgeClass}">${firstType}</div>
                                ${secondType ? `<div class="badge h-auto text-white text-lg border-none ${secondBadgeClass}">${secondType}</div>` : ''}
                        </div>
                        <div id="modal-body">
                        </div>
                    </div>`

    const statsHtml = pokemon.stats
        .map(
            (stat) =>
                `
        <div class="flex justify-between flex-col lg:flex-row mt-4 items-center text-black">
            <span class="font-bold">${stat.stat.name.toUpperCase()} (${stat.base_stat}) </span>
            <progress id="myProgress" class="progress bg-slate-100 w-56" value="${stat.base_stat}" max="100" style="--progress-value-color: ${getProgressColor(firstType)};"></progress>
        </div>
    `
        )
        .join('')

    document.getElementById('modal-body').innerHTML = statsHtml

    document.getElementById('pokemon-modal').classList.remove('hidden')

    document.getElementById('modal-close').addEventListener('click', closeModal)
}

function closeModal() {
    const modal = document.getElementById('pokemon-modal')
    const modalContent = document.querySelector('.modal-content')
    modalContent.classList.add('fadeOut')

    setTimeout(() => {
        modal.classList.add('hidden')
        modalContent.classList.remove('fadeOut')
    }, 200)
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

function getProgressColor(type) {
    const typeColors = {
        normal: '#9ca3af',
        fire: '#ef4444',
        water: '#6390f0',
        grass: '#22c55e',
        electric: '#f7d02c',
        ice: '##22d3ee',
        fighting: '#c22e28',
        poison: '#a33ea1',
        ground: '##ca8a04',
        flying: '#93c5fd',
        psychic: '#ec4899',
        bug: '#15803d',
        rock: '#4b5563',
        ghost: '#6366f1',
        dragon: '#7e22ce',
        dark: '#1f2937',
        steel: '#d1d5db',
        fairy: '#f9a8d4',
    }
    return typeColors[type] || '#d3d3d3'
}
