async function fetchPokemon(page = 1) {
    const limit = 12
    const offset = (page - 1) * limit
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
        if (!response.ok) throw new Error('Failed to fetch Pokémon list')
        const data = await response.json()

        const promises = data.results.map((pokemon) => fetch(pokemon.url).then((res) => res.json()))

        const pokemonData = await Promise.all(promises)
        //console.log(typeof pokemonData)
        renderPokemon(pokemonData)
    } catch (error) {
        console.log(error)
    }
}

const searchInput = document.querySelector('.js-search-input')
const searchBtn = document.querySelector('.js-search-btn')

async function handleSearch() {
    const pokemon = searchInput.value.trim();
    if (pokemon) {
        await searchPokemon(pokemon)
    }else {
        await fetchPokemon(); 
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
        await fetchPokemon(); // โหลด Pokémon ทั้งหมดอีกครั้งเมื่อ input ว่าง
    }
});

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

function renderPokemon(pokemonData) {
    let pokemonDisplay = ''

    if (!Array.isArray(pokemonData)) {
        pokemonData = [pokemonData] // แปลง object เดี่ยวให้เป็นอาร์เรย์
        //console.log(typeof pokemonData)
    }

    pokemonData.forEach((pokemon) => {
        const firstType = pokemon.types[0]?.type.name || '-'
        const secondType = pokemon.types[1]?.type.name || '-'
        pokemonDisplay += `
            <div class="card bg-base-100 w-80 drop-shadow-xl">
                        <div class="flex items-center justify-center w-full h-[10rem]">
                            <img width="100px" height="auto" src="${pokemon.sprites.other.dream_world.front_default}"/>
                        </div>
                        <div class="card-body">
                            <h2 class="card-title">
                                ${pokemon.name}
                            </h2>
                            <div class="card-actions justify-end">
                                <div class="badge badge-neutral">${firstType}</div>
                                <div class="badge badge-primary">${secondType}</div>
                            </div>
                        </div>
            </div>
            `
    })

    document.querySelector('.js-pokemon-grid').innerHTML = pokemonDisplay
}

//searchPokemon('ditto')

fetchPokemon(1)
