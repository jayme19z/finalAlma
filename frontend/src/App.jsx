import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Info from './pages/Info'
import Translator from './pages/Translator'
import Weather from './pages/Weather'
import Souvenirs from './pages/Souvenirs'
import Apps from './pages/Apps'
import EmergencyNumbers from './pages/EmergencyNumbers'
import Places from './pages/Places'
import PlaceDetail from './pages/PlaceDetail'
import Events from './pages/Events'
import Calendar from './pages/Calendar'
import EventDetail from './pages/EventDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Support from './pages/Support'
import Faq from './pages/Faq'
import Pro from './pages/Pro'
import Checkout from './pages/Checkout'

export default function App() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '2rem 0' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/info" element={<PrivateRoute><Info /></PrivateRoute>} />
                    <Route path="/translator" element={<PrivateRoute><Translator /></PrivateRoute>} />
                    <Route path="/weather" element={<PrivateRoute><Weather /></PrivateRoute>} />
                    <Route path="/souvenirs" element={<PrivateRoute><Souvenirs /></PrivateRoute>} />
                    <Route path="/apps" element={<PrivateRoute><Apps /></PrivateRoute>} />
                    <Route path="/emergency" element={<PrivateRoute><EmergencyNumbers /></PrivateRoute>} />
                    <Route path="/places" element={<PrivateRoute><Places /></PrivateRoute>} />
                    <Route path="/places/:id" element={<PrivateRoute><PlaceDetail /></PrivateRoute>} />
                    <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
                    <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
                    <Route path="/events/:id" element={<PrivateRoute><EventDetail /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/support" element={<PrivateRoute><Support /></PrivateRoute>} />
                    <Route path="/faq" element={<PrivateRoute><Faq /></PrivateRoute>} />
                    <Route path="/pro" element={<PrivateRoute><Pro /></PrivateRoute>} />
                    <Route path="/pro/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                </Routes>
            </main>
            <Footer />
        </div>
    )
}
