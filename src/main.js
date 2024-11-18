async function fetchPokemon(page = 1) {
    const limit = 12
    const offset = (page - 1) * limit
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
        if (!response.ok) throw new Error('Failed to fetch Pokémon list')
        const data = await response.json()

        const promises = data.results.map((pokemon) => fetch(pokemon.url).then((res) => res.json()))

        const pokemonData = await Promise.all(promises)
        renderPokemon(pokemonData)
    } catch (error) {
        console.log(error)
    }
}

function renderPokemon(pokemonData) {
    let pokemonDisplay = ''

    pokemonData.forEach((pokemon) => {
        console.log(pokemon)
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

fetchPokemon(1)
