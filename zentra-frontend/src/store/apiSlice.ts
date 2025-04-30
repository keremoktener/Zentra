import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './index'; // Correctly import RootState from the index file where it's defined

// TODO: Replace with your actual backend API base URL from environment variable or config
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Define a base query function that includes authentication headers
const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        // Get the token from the Redux store
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        // Add other default headers if needed
        headers.set('Content-Type', 'application/json');
        return headers;
    },
});

/**
 * Create a base API slice using RTK Query
 * Endpoints are injected from other slice files.
 */
export const apiSlice = createApi({
    reducerPath: 'api', // The name of the slice in the Redux store state
    baseQuery: baseQuery,
    tagTypes: ['BusinessProfile', 'Service', 'Staff', 'BusinessHours', 'Appointment', 'Customer'], // Define tags for caching
    endpoints: (builder) => ({}), // Endpoints will be injected here
}); 