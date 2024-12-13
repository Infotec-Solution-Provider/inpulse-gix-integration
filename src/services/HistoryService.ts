import path from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

class HistoryService {
    private importedCustomersFilePath = path.join(__dirname, 'importedCustomers.json');
    private importedInvoicesFilePath = path.join(__dirname, 'importedInvoices.json');
    private importedCustomers: Set<string>;
    private importedInvoices: Set<string>;

    constructor() {
        this.importedCustomers = this.loadImportedDays(this.importedCustomersFilePath);
        this.importedInvoices = this.loadImportedDays(this.importedInvoicesFilePath);
    }

    private loadImportedDays(filePath: string): Set<string> {
        if (existsSync(filePath)) {
            const data = readFileSync(filePath, 'utf8');
            return new Set(JSON.parse(data));
        }
        return new Set();
    }

    public saveImportedDays(type: "clientes" | "notas") {
        writeFileSync(
            type === "clientes" ? this.importedCustomersFilePath : this.importedInvoicesFilePath,
            JSON.stringify(Array.from(type === "clientes" ? this.importedCustomers : this.importedInvoices))
        );
    }

    public addImportedDay(type: "clientes" | "notas", day: string) {
        if (type === "clientes") {
            this.importedCustomers.add(day);
        }

        if (type === "notas") {
            this.importedInvoices.add(day);;
        }
    }

    public getImportedDays(type: "clientes" | "notas"): Set<string> {
        return type === "clientes" ? this.importedCustomers : this.importedInvoices;
    }
}

export default new HistoryService;