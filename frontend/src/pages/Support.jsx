import { Link } from 'react-router-dom'
import { useLang } from '../i18n/translations'
import './SupportFaq.css'

export default function Support() {
    const { t } = useLang()
    const s = t.profile.support

    return (
        <div className="support-page container">
            <Link to="/profile" className="back-link">{t.common.back}</Link>
            <h1>{s.title}</h1>

            <p className="support-intro fade-in">{s.intro}</p>

            <div className="support-contact-list">
                <a href={`mailto:${s.email}`} className="support-contact-card card fade-in">
                    <span className="support-contact-icon">✉️</span>
                    <div className="support-contact-body">
                        <span className="support-contact-label">{s.emailLabel}</span>
                        <span className="support-contact-value">{s.email}</span>
                    </div>
                </a>

                <a href={`tel:${s.phone.replace(/\s/g, '')}`} className="support-contact-card card fade-in">
                    <span className="support-contact-icon">📞</span>
                    <div className="support-contact-body">
                        <span className="support-contact-label">{s.phoneLabel}</span>
                        <span className="support-contact-value">{s.phone}</span>
                    </div>
                </a>
            </div>

            <p className="support-hours fade-in">{s.hours}</p>
        </div>
    )
}
