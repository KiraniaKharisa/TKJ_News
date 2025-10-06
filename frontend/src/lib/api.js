import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;
export const api = axios.create({
    // baseURL,
    baseURL: "/api",
    headers: {
        "Accept": "application/json",
    },
    withCredentials: true
})
export const apiIndex = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Accept": "application/json",
        "X-Requested-With": 'XMLHttpRequest'
    },
    withCredentials: true
})

export const overrideMethod = (method, api) => {
    return {
        get: (url) => api.get(url, {headers: { "X-HTTP-Method-Override": method}}),
        post: (url, data) => api.post(url, data, {headers: { ...api.defaults.headers.common, "X-HTTP-Method-Override": method }}),
    }
}