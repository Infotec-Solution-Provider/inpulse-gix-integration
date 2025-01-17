import * as dotenv from 'dotenv';
import DatabaseService from "./DatabaseService";
import { Pool, RowDataPacket } from "mysql2/promise";
import { ImportedDay } from '../types/ImportedDay';

class HistoryService {
    private pool: Pool;

    constructor(dbService: typeof DatabaseService) {
        dotenv.config();

        this.pool = dbService.pool;
    }

    public async addImportedDay(type: ImportedDay["tipo"], date: string, error?: string | null) {
        const query = "INSERT INTO gix_dias_importados (tipo, data, erro) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE erro = VALUES(erro);"
        const values = [type, date, error || null];

        await this.pool.query(query, values);
    }

    public async checkIfDayIsImported(type: ImportedDay["tipo"], date: string) {
        const query = "SELECT * FROM gix_dias_importados WHERE tipo = ? AND data = ? AND erro IS NULL";
        const values = [type, date];

        const [rows] = await this.pool.query<RowDataPacket[]>(query, values);

        if (rows.length === 0) return false;
        if ((rows[0] as ImportedDay).erro !== null) return false;

        return true;
    }
}

export default new HistoryService(DatabaseService);