import { useState, useMemo } from 'react'
import { useLang } from '../i18n/translations'
import { translateText } from '../api/client'
import './TranslatorCard.css'

// All languages supported by the Google Cloud Translation API (v2).
// Display names are resolved at runtime via Intl.DisplayNames, so the
// dropdown is automatically localized to the current UI language.
const LANG_CODES = [
    'af', 'ak', 'am', 'ar', 'as', 'ay', 'az', 'be', 'bg', 'bho', 'bm', 'bn',
    'bs', 'ca', 'ceb', 'ckb', 'co', 'cs', 'cy', 'da', 'de', 'doi', 'dv', 'ee',
    'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'fi', 'fil', 'fr', 'fy', 'ga',
    'gd', 'gl', 'gn', 'gom', 'gu', 'ha', 'haw', 'he', 'hi', 'hmn', 'hr', 'ht',
    'hu', 'hy', 'id', 'ig', 'ilo', 'is', 'it', 'ja', 'jv', 'ka', 'kk', 'km',
    'kn', 'ko', 'kri', 'ku', 'ky', 'la', 'lb', 'lg', 'ln', 'lo', 'lt', 'lus',
    'lv', 'mai', 'mg', 'mi', 'mk', 'ml', 'mn', 'mni-Mtei', 'mr', 'ms', 'mt',
    'my', 'ne', 'nl', 'no', 'nso', 'ny', 'om', 'or', 'pa', 'pl', 'ps', 'pt',
    'qu', 'ro', 'ru', 'rw', 'sa', 'sd', 'si', 'sk', 'sl', 'sm', 'sn', 'so',
    'sq', 'sr', 'st', 'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'ti', 'tk',
    'tr', 'ts', 'tt', 'ug', 'uk', 'ur', 'uz', 'vi', 'xh', 'yi', 'yo', 'zh-CN',
    'zh-TW', 'zu',
]
const MAX_CHARS = 2000

// Common travel phrases, written in the language being translated FROM.
const QUICK_PHRASES = {
    en: ['Hello!', 'How are you?', 'Thank you', 'How much is it?', 'Where is the toilet?', 'Help!'],
    ru: ['Привет!', 'Как дела?', 'Спасибо', 'Сколько это стоит?', 'Где туалет?', 'Помогите!'],
    kk: ['Сәлем!', 'Қалыңыз қалай?', 'Рақмет', 'Бұл қанша тұрады?', 'Дәретхана қайда?', 'Көмектесіңіз!'],
    zh: ['你好！', '你好吗？', '谢谢', '多少钱？', '厕所在哪里？', '救命！'],
    tr: ['Merhaba!', 'Nasılsın?', 'Teşekkürler', 'Ne kadar?', 'Tuvalet nerede?', 'İmdat!'],
    hi: ['नमस्ते!', 'आप कैसे हैं?', 'धन्यवाद', 'यह कितने का है?', 'शौचालय कहाँ है?', 'मदद करो!'],
    fr: ['Bonjour !', 'Comment ça va ?', 'Merci', "C'est combien ?", 'Où sont les toilettes ?', "À l'aide !"],
    de: ['Hallo!', 'Wie geht es dir?', 'Danke', 'Wie viel kostet das?', 'Wo ist die Toilette?', 'Hilfe!'],
    es: ['¡Hola!', '¿Cómo estás?', 'Gracias', '¿Cuánto cuesta?', '¿Dónde está el baño?', '¡Ayuda!'],
    ar: ['مرحبا!', 'كيف حالك؟', 'شكرا', 'كم سعره؟', 'أين الحمام؟', 'النجدة!'],
    ja: ['こんにちは！', 'お元気ですか？', 'ありがとう', 'いくらですか？', 'トイレはどこですか？', '助けて！'],
    ko: ['안녕하세요!', '어떻게 지내세요?', '감사합니다', '얼마예요?', '화장실이 어디예요?', '도와주세요!'],
}

export default function TranslatorCard() {
    const { t, lang } = useLang()
    const tr = t.info.translator

    const [text, setText] = useState('')
    const [source, setSource] = useState('auto')
    const [target, setTarget] = useState('ru')
    const [result, setResult] = useState('')
    const [detectedLang, setDetectedLang] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const canTranslate = text.trim().length > 0 && !loading

    const handleTranslate = async (overrideText) => {
        const sourceText = (typeof overrideText === 'string' ? overrideText : text).trim()
        if (!sourceText || loading) return
        setLoading(true)
        setError('')
        setResult('')
        setDetectedLang('')
        try {
            const { data } = await translateText({
                text: sourceText,
                source,
                target,
            })
            setResult(data.translatedText)
            setDetectedLang(data.detectedSourceLanguage || '')
        } catch (err) {
            const msg = err.response?.data?.error || tr.errorGeneric
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleQuickPhrase = (phrase) => {
        if (loading) return
        setText(phrase)
        handleTranslate(phrase)
    }

    const phraseLang = source === 'auto' ? (lang === 'kz' ? 'kk' : lang) : source
    const quickPhrases =
        QUICK_PHRASES[phraseLang] ||
        QUICK_PHRASES[phraseLang.split('-')[0]] ||
        QUICK_PHRASES.en

    const handleClear = () => {
        setText('')
        setResult('')
        setDetectedLang('')
        setError('')
    }

    const handleSwap = () => {
        if (source === 'auto') return
        const prevSource = source
        setSource(target)
        setTarget(prevSource)
        if (result) {
            setText(result)
            setResult('')
            setDetectedLang('')
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && canTranslate) {
            e.preventDefault()
            handleTranslate()
        }
    }

    const uiLocale = lang === 'kz' ? 'kk' : lang

    // Localized language names for the current UI language, with English
    // as a fallback locale and the raw code as a last resort.
    const displayNames = useMemo(() => {
        try {
            return new Intl.DisplayNames([uiLocale, 'en'], { type: 'language' })
        } catch {
            return null
        }
    }, [uiLocale])

    const langName = (code) => {
        const fromI18n = tr.langs[code] || tr.langs[code.split('-')[0]]
        if (fromI18n) return fromI18n
        try {
            const name = displayNames?.of(code)
            if (name && name !== code) {
                return name.charAt(0).toUpperCase() + name.slice(1)
            }
        } catch {
            // Intl can't resolve this code — fall through to the raw code.
        }
        return code
    }

    const sortedLangCodes = useMemo(
        () => [...LANG_CODES].sort((a, b) => langName(a).localeCompare(langName(b), uiLocale)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [uiLocale, displayNames]
    )

    return (
        <div className="translator-card card fade-in">
            <div className="translator-header">
                <h2>{tr.title}</h2>
                <p className="translator-desc">{tr.desc}</p>
            </div>

            <div className="translator-body">
                <textarea
                    className="translator-input"
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                    onKeyDown={handleKeyDown}
                    placeholder={tr.placeholder}
                    rows={3}
                    maxLength={MAX_CHARS}
                />
                <div className="translator-char-count">
                    {text.length}/{MAX_CHARS} {tr.charLimit}
                </div>

                <div className="translator-quick">
                    <span className="translator-quick-label">{tr.quickPhrases}</span>
                    <div className="translator-quick-chips">
                        {quickPhrases.map((phrase) => (
                            <button
                                key={phrase}
                                type="button"
                                className="translator-chip"
                                onClick={() => handleQuickPhrase(phrase)}
                                disabled={loading}
                            >
                                {phrase}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="translator-controls">
                    <div className="translator-selects">
                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="translator-select"
                        >
                            <option value="auto">{tr.autoDetect}</option>
                            {sortedLangCodes.map((code) => (
                                <option key={code} value={code}>
                                    {langName(code)}
                                </option>
                            ))}
                        </select>

                        <button
                            className="translator-swap btn-secondary btn-sm"
                            onClick={handleSwap}
                            disabled={source === 'auto'}
                            title={tr.swapBtn}
                            type="button"
                        >
                            &#8646;
                        </button>

                        <select
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="translator-select"
                        >
                            {sortedLangCodes.map((code) => (
                                <option key={code} value={code}>
                                    {langName(code)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="translator-actions">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleTranslate}
                            disabled={!canTranslate}
                            type="button"
                        >
                            {loading ? tr.loading : tr.translateBtn}
                        </button>
                        {(text || result) && (
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={handleClear}
                                type="button"
                            >
                                {tr.clearBtn}
                            </button>
                        )}
                    </div>
                </div>

                {error && <div className="translator-error">{error}</div>}

                {result && (
                    <div className="translator-result">
                        {detectedLang && source === 'auto' && (
                            <span className="translator-detected">
                                {langName(detectedLang)}
                            </span>
                        )}
                        <p>{result}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
