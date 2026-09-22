// database.js
// --------------------------------------------------
// Conexión central a la base de datos SQLite.
// --------------------------------------------------

import Database from "better-sqlite3";
import { DB_PATH } from "./config.js";

const db = new Database(DB_PATH, { verbose: console.log });

console.log("🗃️  Base de datos conectada en:", DB_PATH);

export default db;
