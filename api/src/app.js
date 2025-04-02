import express from 'express'
import { getDate, getDateDiff, getMainPage } from "./client_routes.js";
import cors from 'cors' 
import dotenv from "dotenv";
import { warn } from './utils/custom_logs.js'
import { ALLOWED_ORIGINS, PORT, ENABLE_CORS } from '../config.js'

dotenv.config();

class App {
    constructor(warningBypass=false) {
        this.warningBypass = warningBypass
        this.app = express()
        this.config()
        this.routes()
    }

    config() {
        this.app.use(express.static('public'));
        
        // Permite consulta entre domínios diferentes
        if (ENABLE_CORS == "true") {
            const allowedOrigins = ALLOWED_ORIGINS?.split(",") || [];
            this.app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : "*" }));
            this.warn("Cross-Origin Resource Sharing: true\nAllowed origins:", allowedOrigins)
        }
    }

    routes() {
        this.app.get('/', getMainPage)
        this.app.get('/api/:date?', getDate)
        this.app.get('/api/diff/:date1/:date2', getDateDiff)
    }

    listen(port=PORT, func=() => console.log('Server is listening on port', PORT)) {
        this.app.listen(port, func)
    }

    warn(...args) {
        if (!this.warningBypass) warn(...args)
    }
}

export default App