import axios from 'axios';

// TODO: Replace with your actual backend API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const apiService = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        // Add other default headers if needed, e.g., Authorization
    },
});

// Optional: Add interceptors for handling requests or responses globally
// Example: Add Authorization token to requests
apiService.interceptors.request.use(
    (config) => {
        // TODO: Get token from your auth state (localStorage, Redux, Context)
        const token = localStorage.getItem('authToken'); // Example: using localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Example: Handle global errors like 401 Unauthorized
apiService.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // TODO: Handle unauthorized access, e.g., redirect to login
            console.error('Unauthorized! Redirecting to login...');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default apiService; 