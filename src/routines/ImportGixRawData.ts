import GixService from "../services/GixService";
import InpulseService from "../services/InpulseService";
import Log from "../utils/log";
import GixDate from "../utils/gix-date";
import * as dotenv from 'dotenv';
import HistoryService from "../services/HistoryService";

class ImportGixRawData {
    private readonly historyService: typeof HistoryService;

    constructor(historyService: typeof HistoryService) {
        this.historyService = historyService;

        dotenv.config();
    }

    public async runRoutine({ clientes, notas }: { clientes: boolean, notas: boolean }) {
        if (!clientes && !notas) return;

        const importDaysInterval = Number(process.env.IMPORT_DAYS_INTERVAL || "1");
        const today = new Date();
        const ONE_DAY = 24 * 60 * 60 * 1000;
        const importTypeText = clientes && notas ? "clientes e notas" : clientes ? "clientes" : "notas";

        Log.info(`Iniciando importação de ${importTypeText}...`);

        for (let i = importDaysInterval; i >= 1; i--) {
            const from = new GixDate(new Date(today.getTime() - (i * ONE_DAY)));

            Log.info(`Processando dia ${(i - importDaysInterval - 1) * -1} de ${importDaysInterval} (${from.toLocaleDateString()}...`);

            if (clientes) {
                await this.historyService.checkIfDayIsImported("clientes", from.toGixString())
                    .then(async isImported => {
                        if (!isImported) {
                            await GixService.forCustomers(from, async (customer) => await InpulseService.saveGixCustomer(customer))
                                .then(async _ => await this.historyService.addImportedDay("clientes", from.toGixString()))
                                .catch(async err => await this.historyService.addImportedDay("clientes", from.toGixString(), err.message));
                        } else {
                            Log.info(`Os clientes deste período já foram importados.`);
                        }
                    });
            }

            if (notas) {
                await this.historyService.checkIfDayIsImported("notas", from.toGixString())
                    .then(async isImported => {
                        if (!isImported) {
                            await GixService.forInvoices(from, async (invoice) => await InpulseService.saveGixInvoice(invoice))
                                .then(async _ => await this.historyService.addImportedDay("notas", from.toGixString()))
                                .catch(async err => await this.historyService.addImportedDay("notas", from.toGixString(), err.message));
                        } else {
                            Log.info(`As notas deste período já foram importadas.`);
                        }
                    });
            }
        }

        Log.info(`Importação de ${importTypeText} concluída.`);
    }
}

export default new ImportGixRawData(HistoryService);