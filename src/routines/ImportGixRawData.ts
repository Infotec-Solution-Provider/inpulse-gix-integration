import GixService from "../services/GixService";
import * as dotenv from 'dotenv';
import InpulseService from "../services/InpulseService";
import Log from "../utils/log";

class ImportGixRawData {
    public async run() {
        dotenv.config();
        const importDaysInterval = Number(process.env.IMPORT_DAYS_INTERVAL || "1");

        const today = new Date();

        for (let i = 0; i < importDaysInterval; i++) {
            const startDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
            const endDate = new Date(today.getTime() - ((i - 1) * 24 * 60 * 60 * 1000));

            const startDateString = `${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, '0')}${String(startDate.getDate()).padStart(2, '0')}`;
            const endDateString = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}`;

            await GixService.forCustomers(startDateString, endDateString, async (customer) => {
                Log.info(`Saving customer with id: ${customer.id}...`);
                await InpulseService.saveRawCustomer(customer);
                Log.info(`Customer with id ${customer.id} succesfully saved.`);
            });

            await GixService.forInvoices(startDateString, endDateString, async (invoice) => {
                Log.info(`Saving invoice with number: ${invoice.numeroNF}...`);
                await InpulseService.saveRawInvoice(invoice);
                Log.info(`Invoice with number ${invoice.numeroNF} succesfully saved.`);
            });
        }
    }
}

export default new ImportGixRawData();