import GixService from "../services/GixService";
import * as dotenv from 'dotenv';
import InpulseService from "../services/InpulseService";
import Log from "../utils/log";

class ImportGixRawData {
    public async run() {
        dotenv.config();
        const importDaysInterval = Number(process.env.IMPORT_DAYS_INTERVAL || "1");
        Log.info(`Importing data from the last ${importDaysInterval} days...`);

        const today = new Date();

        for (let i = 0; i < importDaysInterval; i++) {
            const startDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
            const endDate = new Date(today.getTime() - ((i - 1) * 24 * 60 * 60 * 1000));

            const startDateString = `${startDate.getFullYear()}${String(startDate.getMonth() + 1)
                .padStart(2, '0')}${String(startDate.getDate()).padStart(2, '0')}`;
            const endDateString = `${endDate.getFullYear()}${String(endDate.getMonth() + 1)
                .padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}`;

            Log.info(`Importing data from ${startDateString} to ${endDateString}...`);

            try {
                await GixService.forInvoices(startDateString, endDateString, async (invoice) => {
                    try {
                        Log.info(`Saving invoice with number: ${invoice.numeroNF}...`);
                        await InpulseService.saveRawInvoice(invoice);
                        Log.info(`Invoice with number ${invoice.numeroNF} succesfully saved.`);
                    } catch (error: any) {
                        Log.error(`Error saving invoice with number: ${invoice.numeroNF} | ${error?.message}`);
                    }
                });
            } catch (error: any) {
                Log.error(`Error importing invoices | ${error?.message}`);
            }

            try {
                await GixService.forCustomers(startDateString, endDateString, async (customer) => {
                    try {
                        Log.info(`Saving customer with id: ${customer.id}...`);
                        await InpulseService.saveRawCustomer(customer);
                        Log.info(`Customer with id ${customer.id} succesfully saved.`);
                    } catch (error: any) {
                        Log.error(`Error saving customer with id: ${customer.id} | ${error?.message}`);
                    }
                });
            } catch (error: any) {
                Log.error(`Error importing customers | ${error?.message}`);
            }
        }
    }
}

export default new ImportGixRawData();