import dotenv from 'dotenv';
dotenv.config();


const config = {
    PORT: 3000,
    
    // Allows CORS requests from the specified origins
    ENABLE_CORS: process.env.ENABLE_CORS || false,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
};



export const { PORT, ENABLE_CORS, ALLOWED_ORIGINS } = config;