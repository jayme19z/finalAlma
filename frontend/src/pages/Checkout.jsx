import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../i18n/translations'
import { subscribePro } from '../api/client'
import './Checkout.css'

const formatCardNumber = (v) =>
    v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()

const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export default function Checkout() {
    const { t } = useLang()
    const { user, refreshUser } = useAuth()
    const navigate = useNavigate()

    const [cardNumber, setCardNumber] = useState('')
    const [cardHolder, setCardHolder] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvc, setCvc] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Already-Pro users don't need to pay again.
    useEffect(() => {
        if (user?.is_pro) navigate('/pro', { replace: true })
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await subscribePro({
                card_number: cardNumber,
                card_holder: cardHolder,
                expiry,
                cvc,
            })
            await refreshUser()
            setSuccess(true)
            setTimeout(() => navigate('/profile'), 1800)
        } catch (err) {
            const data = err.response?.data
            const msg = data ? Object.values(data).flat().join('. ') : t.pro.errorGeneric
            setError(msg || t.pro.errorGeneric)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="checkout-page container fade-in">
                <div className="checkout-success card">
                    <div className="success-check">✓</div>
                    <h2>{t.pro.success}</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="checkout-page container fade-in">
            <Link to="/pro" className="back-link">{t.common.back}</Link>

            <div className="checkout-card card">
                <div className="checkout-head">
                    <h1>{t.pro.checkoutTitle}</h1>
                    <p>{t.pro.checkoutSubtitle}</p>
                </div>

                <div className="checkout-summary">
                    <span>★ {t.pro.title}</span>
                    <span className="checkout-amount">{t.pro.monthly}</span>
                </div>

                <form onSubmit={handleSubmit} className="checkout-form">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="form-group">
                        <label>{t.pro.cardNumber}</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t.pro.cardHolder}</label>
                        <input
                            type="text"
                            placeholder="ALMATY TRAVELER"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            required
                        />
                    </div>

                    <div className="checkout-row">
                        <div className="form-group">
                            <label>{t.pro.expiry}</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t.pro.cvc}</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="123"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary checkout-pay" disabled={loading}>
                        {loading ? t.pro.paying : t.pro.payButton}
                    </button>

                    <p className="checkout-note">🔒 {t.pro.testNote}</p>
                </form>
            </div>
        </div>
    )
}
