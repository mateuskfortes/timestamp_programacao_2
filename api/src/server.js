import express from "express"; 
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getData, getDateDiff, getMainPage } from "./client_routes.js";

// pega a rota absoluta 
export const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express()

app.get('/', getMainPage)

app.get('/api/:date?', getData)

app.get('/api/diff/:date1/:date2', getDateDiff)

app.listen('3000', () => console.log('Ouvindo na porta 3000'))