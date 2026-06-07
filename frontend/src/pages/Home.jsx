import { Link } from 'react-router-dom'
import { useLang } from '../i18n/translations'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const Icon = {
    star: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
    ),
    trending: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
    ),
    calendarCheck: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><polyline points="9 15 11 17 15 13" /></svg>
    ),
    globe: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
    ),
    pin: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
    ),
    calendar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
    book: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
    ),
    translate: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" /></svg>
    ),
    cloud: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="19" x2="8" y2="21" /><line x1="8" y1="13" x2="8" y2="15" /><line x1="16" y1="19" x2="16" y2="21" /><line x1="16" y1="13" x2="16" y2="15" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="12" y1="15" x2="12" y2="17" /><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" /></svg>
    ),
    arrow: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
    ),
}

export default function Home() {
    const { t } = useLang()
    const { user } = useAuth()
    const l = t.home.landing

    // Redirect to places map if authenticated, otherwise request login/register
    const startTo = user ? '/places' : '/login'

    const stats = [
        { icon: Icon.star, tone: 'blue', value: l.stat1Value, label: l.stat1Label, sub: l.stat1Sub },
        { icon: Icon.trending, tone: 'cyan', value: l.stat2Value, label: l.stat2Label, sub: l.stat2Sub },
        { icon: Icon.calendarCheck, tone: 'violet', value: l.stat3Value, label: l.stat3Label, sub: l.stat3Sub },
        { icon: Icon.globe, tone: 'green', value: l.stat4Value, label: l.stat4Label, sub: l.stat4Sub },
    ]

    const features = [
        { icon: Icon.pin, tone: 'blue', title: l.f1Title, desc: l.f1Desc, to: '/places', image: '/media/images/homepage/city_guide.png' },
        { icon: Icon.calendar, tone: 'violet', title: l.f2Title, desc: l.f2Desc, to: '/events', image: '/media/images/homepage/upcoming_events.png' },
        { icon: Icon.book, tone: 'red', title: l.f3Title, desc: l.f3Desc, to: '/info', image: '/media/images/homepage/information_directory.png' },
        { icon: Icon.translate, tone: 'green', title: l.f4Title, desc: l.f4Desc, to: '/translator', image: '/media/images/homepage/built-in_translator.png' },
        { icon: Icon.cloud, tone: 'sky', title: l.f5Title, desc: l.f5Desc, to: '/weather', image: '/media/images/homepage/weather_forecast.png' },
        { icon: Icon.calendarCheck, tone: 'pink', title: l.f6Title, desc: l.f6Desc, to: '/calendar', image: '/media/images/homepage/personal_calendar.png' },
    ]

    const partners = [
        { name: 'SXODIM.COM', href: 'https://sxodim.com', logo: '/partners/sxodim.png' },
        { name: 'visit Almaty', href: 'https://visitalmaty.kz', logo: '/partners/visit-almaty-sun.png', lines: ['visit', 'Almaty'] },
        { name: '2ГИС', href: 'https://2gis.kz', logo: '/partners/2gis.png' },
    ]

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="lp-hero">
                <div className="lp-hero-bg" />
                <div className="lp-hero-overlay" />
                <div className="lp-hero-content container fade-in">
                    <h1 className="lp-hero-title">
                        {l.title1}
                        <span className="lp-accent">{l.title2}</span>
                    </h1>
                    <p className="lp-hero-sub">{l.subtitle}</p>
                    <Link to={startTo} className="btn lp-btn">
                        {l.cta} <span className="lp-btn-arrow">{Icon.arrow}</span>
                    </Link>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="lp-section lp-section-alt">
                <div className="container">
                    <h2 className="lp-h2">
                        {l.statsTitle} <span className="lp-accent">{l.statsHighlight}</span>
                    </h2>
                    <p className="lp-lead">{l.statsSubtitle}</p>
                    <div className="lp-stats-grid">
                        {stats.map((s, i) => (
                            <div className="lp-stat-card card fade-in" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                                <span className={`lp-icon-tile tone-${s.tone}`}>{s.icon}</span>
                                <div className="lp-stat-value">{s.value}</div>
                                <div className="lp-stat-label">{s.label}</div>
                                <div className="lp-stat-sub">{s.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section className="lp-section">
                <div className="container">
                    <h2 className="lp-h2 lp-h2-center">
                        {l.featuresTitle} <span className="lp-accent">{l.featuresHighlight}</span>
                    </h2>
                    <p className="lp-lead lp-lead-center">{l.featuresSubtitle}</p>
                    <div className="lp-features-grid">
                        {features.map((f, i) => (
                            <Link to={f.to} className="lp-feature-card card fade-in" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                                <div className={`lp-feature-media tone-${f.tone}`}>
                                    <img src={f.image} alt={f.title} className="lp-feature-img" />
                                </div>
                                <div className="lp-feature-body">
                                    <h3 className="lp-feature-title">{f.title}</h3>
                                    <p className="lp-feature-desc">{f.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners Integrations */}
            <section className="lp-section lp-section-alt">
                <div className="container">
                    <h2 className="lp-h2 lp-h2-sm">{l.partnersTitle}</h2>
                    <p className="lp-lead lp-lead-tight">{l.partnersSubtitle}</p>
                    <div className="lp-partners">
                        {partners.map((p) => (
                            <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" className="lp-partner-chip" aria-label={p.name}>
                                <img src={p.logo} alt={p.name} className={`lp-partner-logo${p.lines ? ' lp-partner-logo-sun' : ''}`} />
                                {p.lines && (
                                    <span className="lp-partner-wordmark">
                                        <span className="lp-wm-1">{p.lines[0]}</span>
                                        <span className="lp-wm-2">{p.lines[1]}</span>
                                    </span>
                                )}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="lp-section">
                <div className="container">
                    <div className="lp-cta">
                        <h2 className="lp-h2 lp-h2-center">
                            {l.ctaTitle} <span className="lp-accent">{l.ctaHighlight}</span>
                        </h2>
                        <p className="lp-lead lp-lead-center">{l.ctaSubtitle}</p>
                        <Link to={startTo} className="btn lp-btn lp-btn-grad">
                            {l.cta} <span className="lp-btn-arrow">{Icon.arrow}</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
