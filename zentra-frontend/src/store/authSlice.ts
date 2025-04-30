import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the user object based on your backend response
interface User {
    id: number;
    email: string;
    role: string; 
    // Add other relevant user fields (firstName, lastName etc.)
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

// Function to load initial state from localStorage (or could be session storage)
const loadInitialState = (): AuthState => {
    try {
        const token = localStorage.getItem('authToken');
        const userString = localStorage.getItem('authUser');
        if (token && userString) {
            const user: User = JSON.parse(userString);
            return {
                user: user,
                token: token,
                isAuthenticated: true,
            };
        }
    } catch (error) {
        console.error('Failed to load auth state from localStorage:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    }
    return {
        user: null,
        token: null,
        isAuthenticated: false,
    };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            // Persist to localStorage
            try {
                 localStorage.setItem('authToken', action.payload.token);
                 localStorage.setItem('authUser', JSON.stringify(action.payload.user));
            } catch (error) {
                 console.error('Failed to save auth state to localStorage:', error);
            }
           
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            // Clear from localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors (optional but good practice)
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated; 