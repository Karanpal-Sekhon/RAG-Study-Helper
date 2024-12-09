import {Navigate} from 'react-router-dom'
import {jwtDecode} from 'jwt-decode'
import api from '../api'
import { REFRESH_TOKEN, ACCESS_TOKEN } from '../constants'
import { useState, useEffect } from 'react'

// Represents a wrapper for a protected route
function ProtectedRoute({children}){
    // Check if we are authorized, before we allow someone to access the route
    // otherwise redirect, and make them login

    const [isAuthorized, setIsAuthorized] = useState(null)

    useEffect( () => {
        auth().catch(()=> setIsAuthorized(false))
    }, [])

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN)
        try {
            // send request to backend for new access token
            const response = await api.post('/api/token/refresh/', {
                refresh: refreshToken
            });
            if (response.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, response.data.access)
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
            }
        } catch (error) {
            console.log(error)
            setIsAuthorized(false)
        }
    }

    const auth = async () => {
        // Look at access token, see if we have one, and check if it is expired or not
        // if expired, auto refresh token in the background

        const token = localStorage.getItem(ACCESS_TOKEN)
        if (!token) {
            setIsAuthorized(false)
            return
        }
        const decoded = jwtDecode(token)
        const tokenExpiration = decoded.exp
        const now = Date.now() / 1000

        if (tokenExpiration < now) {
            await refreshToken()
        } else {
            setIsAuthorized(true)
        }
    }
    
    if (isAuthorized === null) {
        return <div>Loading...</div>
    }

    return isAuthorized ? children : <Navigate to='/login'/>
}

export default ProtectedRoute