import express from "express";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getData, getDateDiff, getMainPage } from "./client_routes.js";
import cors from 'cors' 
import dotenv from "dotenv";
import { warn } from './utils/custom_logs.js'

dotenv.config();

const app = express()

app.use(express.static('public'));

// Permite consulta entre domínios diferentes
if (process.env.ENABLE_CORS === "true") {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
    app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : "*" }));
    warn("Cross-Origin Resource Sharing: true\nAllowed origins:", allowedOrigins)
}

// pega a rota absoluta 
export const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', getMainPage)

app.get('/api/:date?', getData)

app.get('/api/diff/:date1/:date2', getDateDiff)

app.listen('3000', () => console.log('Ouvindo na porta 3000'))