import dotenv from 'dotenv';
dotenv.config();


const config = {
    PORT: process.env.PORT || 3000,
    
    // Allows CORS requests from the specified origins
    ENABLE_CORS: process.env.ENABLE_CORS || "true",
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'https://localhost:5173',
};



export const { PORT, ENABLE_CORS, ALLOWED_ORIGINS } = config;