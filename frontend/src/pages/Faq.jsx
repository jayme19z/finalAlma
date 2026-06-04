import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/translations'
import './SupportFaq.css'

export default function Faq() {
    const { t } = useLang()
    const faq = t.profile.faq
    const [open, setOpen] = useState(null)

    const toggle = (i) => setOpen(open === i ? null : i)

    return (
        <div className="faq-page container">
            <Link to="/profile" className="back-link">{t.common.back}</Link>
            <h1>{faq.title}</h1>

            <div className="faq-list">
                {faq.items.map((item, i) => (
                    <div
                        key={i}
                        className={`faq-item card fade-in ${open === i ? 'faq-item-open' : ''}`}
                    >
                        <button
                            type="button"
                            className="faq-question"
                            onClick={() => toggle(i)}
                            aria-expanded={open === i}
                        >
                            <span>{item.q}</span>
                            <span className="faq-chevron">{open === i ? '−' : '+'}</span>
                        </button>
                        {open === i && <p className="faq-answer">{item.a}</p>}
                    </div>
                ))}
            </div>
        </div>
    )
}
