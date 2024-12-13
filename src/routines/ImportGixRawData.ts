import GixService from "../services/GixService";
import InpulseService from "../services/InpulseService";
import Log from "../utils/log";
import GixDate from "../utils/gix-date";
import * as dotenv from 'dotenv';
import HistoryService from "../services/HistoryService";

dotenv.config();

class ImportGixRawData {
    private async customersFrom(startDate: GixDate, endDate: GixDate) {
        try {
            Log.info(`Importando clientes do periodo: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}...`);

            await GixService.forCustomers(startDate, endDate, async (customer) => await InpulseService.saveGixCustomer(customer));
            HistoryService.addImportedDay("clientes", startDate.toGixString());
        } catch (error: any) {
            Log.error(`Falha ao importar os clientes do periodo: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()} | ${error?.message}`, error);
        }
    }

    private async invoicesFrom(startDate: GixDate, endDate: GixDate) {
        try {
            Log.info(`Importando faturas do periodo: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}...`);

            await GixService.forInvoices(startDate, endDate, async (invoice) => await InpulseService.saveGixInvoice(invoice));
            HistoryService.addImportedDay("notas", startDate.toGixString());
        } catch (error: any) {
            Log.error(`Falha ao importar as faturas do periodo: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()} | ${error?.message}`, error);
        }
    }

    public async runRoutine(type: "clientes" | "notas") {
        const importDaysInterval = Number(process.env.IMPORT_DAYS_INTERVAL || "1");
        const today = new Date();
        const ONE_DAY = 24 * 60 * 60 * 1000;

        Log.info(`Iniciando importação de ${type}...`);
        Log.debug(`IMPORT_DAYS_INTERVAL: ${importDaysInterval}`);
        Log.debug(`Data de hoje: ${today.toLocaleDateString()}`);

        for (let i = importDaysInterval; i >= 1; i--) {
            Log.debug(`Processando dia ${i} de ${importDaysInterval}...`);
            const from = new GixDate(new Date(today.getTime() - (i * ONE_DAY)));
            const to = new GixDate(new Date(today.getTime() - ((i - 1) * ONE_DAY)));

            Log.debug(`Processando período: ${from.toLocaleDateString()} - ${to.toLocaleDateString()}`);

            if (type === "clientes" && !HistoryService.getImportedDays("clientes").has(from.toGixString())) {
                Log.debug(`Importando clientes para o dia: ${from.toGixString()}`);
                await this.customersFrom(from, to);
            } else if (type === "clientes") {
                Log.debug(`Clientes já importados para o dia: ${from.toGixString()}`);
            }

            if (type === "notas" && !HistoryService.getImportedDays("notas").has(from.toGixString())) {
                Log.debug(`Importando faturas para o dia: ${from.toGixString()}`);
                await this.invoicesFrom(from, to);
            } else if (type === "notas") {
                Log.debug(`Faturas já importadas para o dia: ${from.toGixString()}`);
            }
        }

        Log.info(`Importação de ${type} concluída.`);
    }
}

export default new ImportGixRawData();