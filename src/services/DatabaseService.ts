import * as dotenv from 'dotenv';
import { createPool, Pool } from "mysql2/promise";

class DatabaseService {
    public readonly pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }
}

dotenv.config();

export default new DatabaseService(createPool({
    host: process.env.INPULSE_DB_HOST,
    user: process.env.INPULSE_DB_USER,
    password: process.env.INPULSE_DB_PASSWORD,
    database: process.env.INPULSE_DB_NAME
}));