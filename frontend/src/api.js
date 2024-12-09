// Here we write the interceptor (axios interceptor)
// Every time we send a request, will check if we have an access token, if we do, auto add to the request
/*
Will intercept any requests that we will send, and will auto add the correct headers
So that we do not have to manually add the headers each time we send a request
*/

import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})


api.interceptors.request.use(
    (config) => {
        // look in local storage, check if we have an access token, if we do, add to request header
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.log(request)
        return Promise.reject(error)
    }
)

export default api