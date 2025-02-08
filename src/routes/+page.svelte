<script lang="ts">
    //C:\xampp\htdocs\weather_app\src\routes\+\page.svelte
    import { onMount } from 'svelte';
    import { WeatherService } from '$lib/services/weather';
    import { AuthService } from '$lib/services/auth';
    import ParticlesBackground from '$lib/components/ParticlesBackground.svelte';

    let city = '';
    let weatherData: any = null;
    let error: string = '';
    let loading = false;
    let isLoggedIn = false;
    let username = '';
    let password = '';
    let showRegister = false;
    let user: any = null;
    let searchHistory: any[] = [];

    // Load history on mount regardless of login status
    onMount(async () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            user = JSON.parse(savedUser);
            isLoggedIn = true;
        }
        await loadSearchHistory();
    });

    async function handleLogin() {
        try {
            error = '';
            user = await AuthService.login(username, password);
            isLoggedIn = true;
            localStorage.setItem('user', JSON.stringify(user));
            username = '';
            password = '';
            await loadSearchHistory();
        } catch (e: any) {
            error = e.message;
        }
    }

    async function handleRegister() {
        try {
            error = '';
            await AuthService.register(username, password);
            user = await AuthService.login(username, password);
            isLoggedIn = true;
            localStorage.setItem('user', JSON.stringify(user));
            username = '';
            password = '';
            await loadSearchHistory();
        } catch (e: any) {
            error = e.message;
        }
    }

    function handleLogout() {
        user = null;
        isLoggedIn = false;
        localStorage.removeItem('user');
        searchHistory = [];
    }

    async function loadSearchHistory() {
        try {
            const result = await WeatherService.getSearchHistory();
            searchHistory = result.history || [];
        } catch (e: any) {
            error = e.message;
        }
    }

    async function searchWeather() {
        if (!city.trim()) {
            error = 'Please enter a city name';
            return;
        }
        
        loading = true;
        error = '';
        
        try {
            weatherData = await WeatherService.getWeather(city, user?.user_id);
            await loadSearchHistory();
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<ParticlesBackground />

<main>
    <div class="container glass">
        <h1>Weather Forecast</h1>
        
        {#if !isLoggedIn}
            <div class="auth-container">
                <h2>{showRegister ? 'Register' : 'Login'}</h2>
                
                <form class="auth-form" on:submit|preventDefault={showRegister ? handleRegister : handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        bind:value={username}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        bind:value={password}
                        required
                    />
                    
                    {#if error}
                        <div class="error">{error}</div>
                    {/if}
                    
                    <button type="submit">
                        {showRegister ? 'Register' : 'Login'}
                    </button>
                    
                    <p class="auth-switch">
                        {showRegister ? "Already have an account?" : "Don't have an account?"}
                        <button type="button" class="link-button" on:click={() => showRegister = !showRegister}>
                            {showRegister ? 'Login' : 'Register'}
                        </button>
                    </p>
                </form>
            </div>
        {:else}
            <button class="logout-btn" on:click={handleLogout}>Logout</button>
            
            <div class="search-box">
                <input 
                    type="text" 
                    bind:value={city} 
                    placeholder="Enter city name"
                    on:keydown={(e) => e.key === 'Enter' && !loading && searchWeather()}
                />
                <button on:click={searchWeather} disabled={loading}>
                    {loading ? 'Loading...' : 'Search'}
                </button>
            </div>

            {#if error}
                <div class="error">{error}</div>
            {/if}

            {#if weatherData}
                <div class="weather-display">
                    <div class="location-info">
                        <h2>{weatherData.name}</h2>
                        <p class="location">{weatherData.location.region}, {weatherData.location.country}</p>
                        <p class="time">{weatherData.location.localtime}</p>
                    </div>
                    
                    <img 
                        src={weatherData.weather[0].icon}
                        alt={weatherData.weather[0].description}
                        class="weather-icon"
                    />
                    <div class="temperature">
                        {Math.round(weatherData.main.temp)}°C
                    </div>
                    <div class="description">
                        {weatherData.weather[0].description}
                    </div>

                    <div class="details-grid">
                        <div class="detail-card">
                            <span class="label">FEELS LIKE</span>
                            <span class="value">{Math.round(weatherData.main.feels_like)}°C</span>
                        </div>
                        <div class="detail-card">
                            <span class="label">HUMIDITY</span>
                            <span class="value">{weatherData.main.humidity}%</span>
                        </div>
                        <div class="detail-card">
                            <span class="label">WIND</span>
                            <span class="value">{weatherData.current.wind_kph} km/h {weatherData.current.wind_dir}</span>
                        </div>
                        <div class="detail-card">
                            <span class="label">PRESSURE</span>
                            <span class="value">{weatherData.current.pressure_mb} mb</span>
                        </div>
                    </div>
                </div>
            {/if}

            {#if searchHistory.length > 0}
                <div class="history-container">
                    <h2>Global Search History</h2>
                    {#each searchHistory as search}
                        <div class="history-item">
                            <span class="user">{search.username}</span>
                            <span class="city">{search.city}</span>
                            <span class="temp">{search.temperature}°C</span>
                            <span class="time">{new Date(search.searched_at).toLocaleString()}</span>
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
    </div>
</main>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        font-family: 'Inter', sans-serif;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: #f8fafc;
    }

    main {
        min-height: 100vh;
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: center;
        background-size: cover;
        background-position: center;
        position: relative;
        padding: 2rem 0;
    }

    main::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
            radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 40%);
        z-index: 2;
    }

    .container {
        position: relative;
        z-index: 3;
        width: 90%;
        max-width: 800px;
        min-height: 80vh;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -2px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.05);
    }

    .search-box {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    input {
        flex: 1;
        padding: 1rem 1.5rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: #fff;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    input:focus {
        outline: none;
        border-color: rgba(56, 189, 248, 0.5);
        box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
    }

    button {
        padding: 1rem 2rem;
        background: rgba(56, 189, 248, 0.1);
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 12px;
        color: #38bdf8;
        font-weight: 500;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    button:hover {
        background: rgba(56, 189, 248, 0.2);
        transform: translateY(-1px);
    }

    .weather-display {
        text-align: center;
        margin: 2rem 0;
    }

    .temperature {
        font-size: 6rem;
        font-weight: 700;
        font-family: 'Poppins', sans-serif;
        background: linear-gradient(135deg, #38bdf8, #818cf8);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 1;
        margin: 1rem 0;
    }

    .weather-icon {
        width: 120px;
        height: 120px;
        filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.3));
    }

    .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
    }

    .detail-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 1.5rem;
        transition: transform 0.3s ease;
    }

    .detail-card:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.05);
    }

    .history-container {
        margin-top: 2rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 1.5rem;
    }

    .history-container h2 {
        margin-bottom: 1rem;
        font-size: 1.5rem;
        color: #38bdf8;
    }

    .history-item {
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    }

    .history-item:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .history-item .user {
        color: #38bdf8;
        font-weight: 500;
    }

    .history-item .city {
        font-weight: 500;
    }

    .history-item .temp {
        color: #38bdf8;
    }

    .history-item .time {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
    }

    .auth-container {
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        backdrop-filter: blur(5px);
    }

    .auth-container h2 {
        text-align: center;
        margin-bottom: 2rem;
        color: #38bdf8;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .auth-form input {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.2);
        color: white;
        font-size: 1rem;
    }

    .auth-form input::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }

    .auth-form button[type="submit"] {
        padding: 0.75rem;
        background: #38bdf8;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .auth-form button[type="submit"]:hover {
        background: #0ea5e9;
    }

    .auth-switch {
        text-align: center;
        margin-top: 1rem;
        color: rgba(255, 255, 255, 0.8);
    }

    .link-button {
        background: none;
        border: none;
        color: #38bdf8;
        cursor: pointer;
        font-size: inherit;
        padding: 0;
        margin-left: 0.5rem;
        text-decoration: underline;
    }

    .link-button:hover {
        color: #0ea5e9;
    }

    .error {
        color: #ef4444;
        text-align: center;
        margin: 0.5rem 0;
    }

    .logout-btn {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        padding: 0.5rem 1rem;
        opacity: 0.7;
    }

    .logout-btn:hover {
        opacity: 1;
    }

    @media (max-width: 768px) {
        .container {
            padding: 1.5rem;
            min-height: 90vh;
        }

        .temperature {
            font-size: 4rem;
        }

        .weather-icon {
            width: 80px;
            height: 80px;
        }

        .history-item {
            grid-template-columns: 1fr auto;
            gap: 0.5rem;
        }

        .history-item .user,
        .history-item .time {
            grid-column: 1 / -1;
            font-size: 0.9rem;
        }

        .auth-container {
            padding: 1.5rem;
        }
    }
</style>
