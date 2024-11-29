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
                    await InpulseService.saveRawInvoice(invoice);
                });
            } catch (error: any) {
                Log.error(`Error importing invoices | ${error?.message}`);
            } finally {
                try {
                    await GixService.forCustomers(startDateString, endDateString, async (customer) => {
                        await InpulseService.saveRawCustomer(customer);
                    });
                } catch (error: any) {
                    Log.error(`Error importing customers | ${error?.message}`);
                }
            }
        }
    }
}

export default new ImportGixRawData();