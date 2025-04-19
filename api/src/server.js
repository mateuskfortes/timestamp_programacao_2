import App from "./app.js";
import database from './database.js'

const app = new App(database)

app.listen()