/**
 * @file client.js
 * @description Centralized Axios HTTP client configuration and API endpoints.
 * Configured with request/response interceptors to handle JWT bearer authentication and token refreshing.
 */

import axios from 'axios'

const API_BASE = '/api/v1'

const client = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
})

// Request interceptor to attach JWT token to authorized endpoints.
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor to handle token expiration (401) and attempt to refresh access tokens.
client.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            const refresh = localStorage.getItem('refresh_token')
            if (refresh) {
                try {
                    const { data } = await axios.post(`${API_BASE}/users/token/refresh/`, { refresh })
                    localStorage.setItem('access_token', data.access)
                    original.headers.Authorization = `Bearer ${data.access}`
                    return client(original)
                } catch {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    window.location.href = '/login'
                }
            }
        }
        return Promise.reject(error)
    }
)

/**
 * Fetch a list of places.
 * @param {Object} [params] - Query parameters.
 * @returns {Promise<Object>} Axios response promise.
 */
export const getPlaces = (params) => client.get('/places/', { params })

/**
 * Fetch detail of a specific place.
 * @param {number|string} id - Place ID.
 * @returns {Promise<Object>} Axios response promise.
 */
export const getPlace = (id) => client.get(`/places/${id}/`)

/**
 * Fetch a list of events.
 * @param {Object} [params] - Query parameters.
 * @returns {Promise<Object>} Axios response promise.
 */
export const getEvents = (params) => client.get('/events/events/', { params })

/**
 * Fetch details of a specific event.
 * @param {number|string} id - Event ID.
 * @returns {Promise<Object>} Axios response promise.
 */
export const getEvent = (id) => client.get(`/events/events/${id}/`)

/**
 * Fetch calendar events for the current user.
 * @returns {Promise<Object>} Axios response promise.
 */
export const getCalendarEvents = () => client.get('/events/calendar/')

/**
 * Add an event to the user's calendar.
 * @param {Object} data - Calendar event data.
 * @returns {Promise<Object>} Axios response promise.
 */
export const addCalendarEvent = (data) => client.post('/events/calendar/', data)

/**
 * Remove an event from the user's calendar.
 * @param {number|string} id - Calendar event ID.
 * @returns {Promise<Object>} Axios response promise.
 */
export const removeCalendarEvent = (id) => client.delete(`/events/calendar/${id}/`)

/**
 * Fetch souvenirs list.
 * @returns {Promise<Object>} Axios response promise.
 */
export const getSouvenirs = () => client.get('/info/souvenirs/')

/**
 * Fetch useful tourist application links.
 * @returns {Promise<Object>} Axios response promise.
 */
export const getApps = () => client.get('/info/apps/')

/**
 * Fetch promotional banner advertisements.
 * @returns {Promise<Object>} Axios response promise.
 */
export const getAdvertisements = () => client.get('/info/advertisements/')

/**
 * Translate short text snippets.
 * @param {Object} data - Source and target translation details.
 * @returns {Promise<Object>} Axios response promise.
 */
export const translateText = (data) => client.post('/translator/', data)

/**
 * Authenticate user with credentials.
 * @param {Object} data - Login credentials.
 * @returns {Promise<Object>} Axios response promise.
 */
export const login = (data) => axios.post(`${API_BASE}/users/token/`, data)

/**
 * Register a new user account.
 * @param {Object} data - Registration form fields.
 * @returns {Promise<Object>} Axios response promise.
 */
export const register = (data) => axios.post(`${API_BASE}/users/register/`, data)

/**
 * Fetch the profile of the currently logged-in user.
 * @returns {Promise<Object>} Axios response promise.
 */
export const getProfile = () => client.get('/users/profile/')

/**
 * Update authenticated user's profile details.
 * @param {Object} data - Updated profile fields.
 * @returns {Promise<Object>} Axios response promise.
 */
export const updateProfile = (data) => client.patch('/users/profile/', data)

/**
 * Subscribe user to the Pro plan.
 * @param {Object} data - Subscription details.
 * @returns {Promise<Object>} Axios response promise.
 */
export const subscribePro = (data) => client.post('/users/subscribe/', data)

export default client
