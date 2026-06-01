import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../i18n/translations'
import './Pro.css'

// Feature availability is language-independent.
// 'yes' = included, 'no' = not included, 'limited' = limited access.
const FEATURES = [
    { key: 'places', free: 'yes', pro: 'yes' },
    { key: 'eventsCal', free: 'yes', pro: 'yes' },
    { key: 'weather', free: 'yes', pro: 'yes' },
    { key: 'translator', free: 'limited', pro: 'yes' },
    { key: 'routes', free: 'no', pro: 'yes' },
    { key: 'offline', free: 'no', pro: 'yes' },
    { key: 'adfree', free: 'no', pro: 'yes' },
    { key: 'support', free: 'no', pro: 'yes' },
]

function Cell({ state, limitedLabel }) {
    if (state === 'yes') return <span className="cell-yes">✓</span>
    if (state === 'limited') return <span className="cell-limited">{limitedLabel}</span>
    return <span className="cell-no">—</span>
}

export default function Pro() {
    const { t } = useLang()
    const { user } = useAuth()
    const navigate = useNavigate()
    const isPro = !!user?.is_pro

    return (
        <div className="pro-page container fade-in">
            <Link to="/profile" className="back-link">{t.common.back}</Link>

            <div className="pro-hero">
                <span className="pro-hero-badge">★ {t.pro.badge}</span>
                <h1>{t.pro.title}</h1>
                <p className="pro-hero-sub">{t.pro.subtitle}</p>
                <div className="pro-price">{t.pro.monthly}</div>
            </div>

            <div className="pro-table card">
                <div className="pro-table-head">
                    <div className="pt-feature" />
                    <div className="pt-col">{t.pro.free}</div>
                    <div className="pt-col pt-col-pro">★ {t.pro.proPlan}</div>
                </div>
                {FEATURES.map((f) => (
                    <div className="pro-table-row" key={f.key}>
                        <div className="pt-feature">{t.pro.feat[f.key]}</div>
                        <div className="pt-col"><Cell state={f.free} limitedLabel={t.pro.limited} /></div>
                        <div className="pt-col pt-col-pro"><Cell state={f.pro} limitedLabel={t.pro.limited} /></div>
                    </div>
                ))}
            </div>

            <div className="pro-buy">
                {isPro ? (
                    <div className="pro-active">★ {t.pro.alreadyPro}</div>
                ) : (
                    <button className="btn btn-primary pro-buy-btn" onClick={() => navigate('/pro/checkout')}>
                        {t.pro.buyButton}
                    </button>
                )}
            </div>
        </div>
    )
}
