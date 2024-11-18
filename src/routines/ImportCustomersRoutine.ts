import GixService from "../services/GixService";
import * as dotenv from 'dotenv';
import InpulseService from "../services/InpulseService";

class ImportCustomersRoutine {
    public static async run() {
        dotenv.config();
        const importDaysInterval = Number(process.env.IMPORT_DAYS_INTERVAL || "1");

        const today = new Date();

        for (let i = 0; i < importDaysInterval; i++) {
            const startDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
            const endDate = new Date(today.getTime() - ((i - 1) * 24 * 60 * 60 * 1000));

            const startDateString = `${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, '0')}${String(startDate.getDate()).padStart(2, '0')}`;
            const endDateString = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}`;

            await GixService.forCustomers(startDateString, endDateString, async (customer) => {
                await InpulseService.saveRawCustomer(customer);
            });

            await GixService.forInvoices(startDateString, endDateString, async (invoice) => {
                await InpulseService.saveRawInvoice(invoice);
            });
        }
    }
}

export default new ImportCustomersRoutine();