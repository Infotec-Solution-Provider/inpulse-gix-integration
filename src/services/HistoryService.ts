import path from "path";
import { RoutineHistoryRecord } from "../types/RoutineHistoryRecord";
import { readFileSync, writeFileSync } from "fs";

class HistoryService {
    private invoiceRecords: Array<RoutineHistoryRecord> = [];
    private customerRecords: Array<RoutineHistoryRecord> = [];

    constructor() {
        this.loadHistory();
    }

    private loadHistory() {
        const historyPath = path.join(__dirname, "history.txt");
        const historyString = readFileSync(historyPath, "utf8");

        historyString.split("\r\n").forEach(line => {
            const [type, date] = line.split("_");

            const arr = type === "invoice" ? this.invoiceRecords : this.customerRecords;

            const year = date.slice(0, 4);
            const month = date.slice(4, 6);
            const day = date.slice(6);

            arr.push({ year, month, day });
        });
    }

    public saveHistory() {
        const historyPath = path.join(__dirname, "history.txt");

        const historyLines: string[] = [];

        this.invoiceRecords.forEach(record => {
            const date = `${record.year}${record.month}${record.day}`;
            historyLines.push(`invoice_${date}`);
        });

        this.customerRecords.forEach(record => {
            const date = `${record.year}${record.month}${record.day}`;
            historyLines.push(`customer_${date}`);
        });

        const historyString = historyLines.join("\r\n");

        writeFileSync(historyPath, historyString, "utf8");
    }

    public getMostRecentProcessedDate(type: "customers" | "invoices") {
        const records = type === "invoices" ? this.invoiceRecords : this.customerRecords;

        if (records.length === 0) {
            return null;
        }

        const mostRecentRecord = records.reduce((latest, record) => {
            const recordDate = new Date(`${record.year}-${record.month}-${record.day}`);
            const latestDate = new Date(`${latest.year}-${latest.month}-${latest.day}`);
            return recordDate > latestDate ? record : latest;
        });

        return mostRecentRecord;
    }
}

export default new HistoryService;