import { useState, useEffect } from 'react'
import { useLang } from '../i18n/translations'
import { fetchAlmatyWeather } from '../api/weatherApi'
import './WeatherCard.css'

function formatDayLabel(dateStr, t, lang) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const date = new Date(dateStr + 'T00:00:00')
    date.setHours(0, 0, 0, 0)

    const diffMs = date.getTime() - today.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === -1) return t.info.weather.yesterday
    if (diffDays === 0) return t.info.weather.today
    if (diffDays === 1) return t.info.weather.tomorrow

    const locales = {
        kz: 'kk-KZ',
        ru: 'ru-RU',
        zh: 'zh-CN',
        tr: 'tr-TR',
        hi: 'hi-IN',
        ko: 'ko-KR',
        en: 'en-US'
    }
    const locale = locales[lang] || 'en-US'
    return date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })
}

function isToday(dateStr) {
    const today = new Date()
    const d = new Date(dateStr + 'T00:00:00')
    return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
    )
}

const LOCALES = {
    kz: 'kk-KZ', ru: 'ru-RU', zh: 'zh-CN', tr: 'tr-TR',
    hi: 'hi-IN', ko: 'ko-KR', en: 'en-US',
}

function formatTime(iso, lang) {
    if (!iso) return '—'
    const date = new Date(iso)
    if (isNaN(date.getTime())) return '—'
    return date.toLocaleTimeString(LOCALES[lang] || 'en-US', {
        hour: 'numeric',
        minute: '2-digit',
    })
}

function getWeatherIcon(weatherKey) {
    const key = (weatherKey || '').toLowerCase()
    
    // Rain / Storm
    if (key.includes('rain') || key.includes('drizzle') || key.includes('thunderstorm') || key.includes('storm')) {
        return (
            <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                <line x1="8" y1="21" x2="8" y2="23" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="16" y1="21" x2="16" y2="23" />
            </svg>
        )
    }
    
    // Snow
    if (key.includes('snow') || key.includes('grains')) {
        return (
            <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#93c5fd' }}>
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                <line x1="8" y1="22" x2="8.01" y2="22" />
                <line x1="12" y1="22" x2="12.01" y2="22" />
                <line x1="16" y1="22" x2="16.01" y2="22" />
            </svg>
        )
    }

    // Partly cloudy / Mostly clear
    if (key.includes('mainlyclear') || key.includes('partlycloudy')) {
        return (
            <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41" stroke="#eab308" />
                <circle cx="12" cy="12" r="4" stroke="#eab308" fill="#eab308" fillOpacity="0.2" />
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="var(--bg-surface)" stroke="currentColor" />
            </svg>
        )
    }
    
    // Cloud / Overcast / Fog
    if (key.includes('cloud') || key.includes('overcast') || key.includes('fog')) {
        return (
            <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)' }}>
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
        )
    }
    
    // Sun / Clear
    return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#eab308' }}>
            <circle cx="12" cy="12" r="5" fill="#eab308" opacity="0.2" />
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    )
}

export default function WeatherCard() {
    const { t, lang } = useLang()
    const w = t.info.weather

    const [weather, setWeather] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedDate, setSelectedDate] = useState(null)

    useEffect(() => {
        setLoading(true)
        setError('')
        fetchAlmatyWeather()
            .then((data) => {
                setWeather(data)
                const todayDay = data.days?.find((d) => isToday(d.date))
                setSelectedDate(todayDay?.date || data.current?.date || data.days?.[0]?.date || null)
            })
            .catch(() => setError(w.errorLoading))
            .finally(() => setLoading(false))
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const selectedDay = weather?.days?.find((d) => d.date === selectedDate) || null

    return (
        <div className="weather-card card fade-in">
            <div className="weather-header">
                <h2>{w.title}</h2>
                <p className="weather-desc">{w.desc}</p>
            </div>

            <div className="weather-body">
                {loading ? (
                    <div className="weather-loading">
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <div className="weather-error">{error}</div>
                ) : weather ? (
                    <>
                        {weather.current && (
                            <div className="weather-current">
                                <div className="weather-current-main">
                                    <div className="weather-current-icon">
                                        {getWeatherIcon(weather.current.weatherKey)}
                                    </div>
                                    <div className="weather-current-info">
                                        <div className="weather-current-temp">{weather.current.temp}°C</div>
                                        <div className="weather-current-condition">
                                            {w.codes[weather.current.weatherKey] || weather.current.weatherKey}
                                        </div>
                                        <div className="weather-current-feels">
                                            {w.feelsLike} {weather.current.feelsLike}°
                                        </div>
                                    </div>
                                </div>
                                <span className="weather-current-location">{w.location}</span>
                            </div>
                        )}

                        <h3 className="weather-section-title">{w.forecastTitle}</h3>
                        <div className="weather-days-scroll">
                            <div className="weather-days">
                                {weather.days.map((day) => {
                                    const isSelected = day.date === selectedDate
                                    return (
                                        <button
                                            key={day.date}
                                            type="button"
                                            onClick={() => setSelectedDate(day.date)}
                                            aria-pressed={isSelected}
                                            className={`weather-day${isToday(day.date) ? ' weather-day--today' : ''}${isSelected ? ' weather-day--selected' : ''}`}
                                        >
                                            <span className="weather-day-label">
                                                {formatDayLabel(day.date, t, lang)}
                                            </span>
                                            <div className="weather-day-icon">
                                                {getWeatherIcon(day.weatherKey)}
                                            </div>
                                            <span className="weather-day-condition">
                                                {w.codes[day.weatherKey] || day.weatherKey}
                                            </span>
                                            <div className="weather-day-temps">
                                                <span className="weather-temp-max">
                                                    {day.tempMax}°
                                                </span>
                                                <span className="weather-temp-separator">/</span>
                                                <span className="weather-temp-min">
                                                    {day.tempMin}°
                                                </span>
                                            </div>
                                            <div className="weather-day-precip">
                                                <span className="weather-day-precip-label">{w.precip}</span>
                                                <span>{day.precipProbability}%</span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {selectedDay && (
                            <>
                                <h3 className="weather-section-title">
                                    {formatDayLabel(selectedDay.date, t, lang)} · {w.highlightTitle}
                                </h3>
                                <div className="weather-highlights">
                                    <div className="weather-highlight">
                                        <span className="weather-highlight-label">{w.windStatus}</span>
                                        <span className="weather-highlight-value">
                                            {selectedDay.windSpeed ?? '—'}<span className="weather-highlight-unit">{w.unitKmh}</span>
                                        </span>
                                    </div>
                                    <div className="weather-highlight">
                                        <span className="weather-highlight-label">{w.humidity}</span>
                                        <span className="weather-highlight-value">
                                            {selectedDay.humidity ?? '—'}<span className="weather-highlight-unit">%</span>
                                        </span>
                                    </div>
                                    <div className="weather-highlight">
                                        <span className="weather-highlight-label">{w.uvIndex}</span>
                                        <span className="weather-highlight-value">
                                            {selectedDay.uvIndex ?? '—'}<span className="weather-highlight-unit">{w.unitUv}</span>
                                        </span>
                                    </div>
                                    <div className="weather-highlight">
                                        <span className="weather-highlight-label">{w.visibility}</span>
                                        <span className="weather-highlight-value">
                                            {selectedDay.visibility ?? '—'}<span className="weather-highlight-unit">{w.unitKm}</span>
                                        </span>
                                    </div>
                                    <div className="weather-highlight">
                                        <span className="weather-highlight-label">{w.sunrise}</span>
                                        <span className="weather-highlight-value weather-highlight-value--sm">
                                            {formatTime(selectedDay.sunrise, lang)}
                                        </span>
                                    </div>
                                    <div className="weather-highlight">
                                        <span className="weather-highlight-label">{w.sunset}</span>
                                        <span className="weather-highlight-value weather-highlight-value--sm">
                                            {formatTime(selectedDay.sunset, lang)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    )
}
