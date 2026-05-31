/**
 * Weather API service.
 * Fetches the daily Almaty forecast from the backend weather module
 * (which proxies Open-Meteo). Returns:
 *   { days: [ { date, tempMax, tempMin, weatherCode, weatherKey, icon, precipProbability } ] }
 */

const WEATHER_URL = '/api/v1/weather/'

export async function fetchAlmatyWeather() {
    const res = await fetch(WEATHER_URL)
    if (!res.ok) {
        throw new Error(`Weather API error: ${res.status}`)
    }
    return res.json()
}