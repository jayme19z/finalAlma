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
                                <div className="weather-current-info">
                                    <div className="weather-current-temp">{weather.current.temp}°C</div>
                                    <div className="weather-current-condition">
                                        {w.codes[weather.current.weatherKey] || weather.current.weatherKey}
                                    </div>
                                    <div className="weather-current-feels">
                                        {w.feelsLike} {weather.current.feelsLike}°
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
