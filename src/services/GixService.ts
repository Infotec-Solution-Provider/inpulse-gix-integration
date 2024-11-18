import * as dotenv from 'dotenv';
import axios, { AxiosInstance } from "axios";
import { GixInvoice } from "../types/GixInvoice";
import { GixCustomer } from "../types/GixCustomer";
import { GixInvoiceResponse } from "../types/GixInvoiceResponse";
import Log from '../utils/log';

class GixService {
    private api: AxiosInstance;

    constructor() {
        dotenv.config();

        const authBuffer = Buffer.from(`${process.env.GIX_API_USER}:${process.env.GIX_API_PASSWORD}`).toString('base64');
        const authString = `Basic ${authBuffer}`;

        this.api = axios.create({
            baseURL: process.env.GIX_API_URL,
            headers: { Authorization: authString }
        });
    }

    private async fetchInvoices(startDate: string, endDate: string, page: number) {
        const url = "/shx-integracao-servicos/notas";
        const body = { dataInicial: startDate, dataFinal: endDate, paginacao: page };
        const response = await this.api.post<GixInvoiceResponse>(url, body);

        return response.data;
    }

    private async fetchCustomers(startDate: string, endDate: string, page: number) {
        const url = "/shx-integracao-servicos/clientes";
        const params = { dataOcorrencia: startDate, dataFim: endDate, pagina: page };
        const response = await this.api.get<Array<GixCustomer>>(url, { params });

        return response.data;
    }

    public async forInvoices(startDate: string, endDate: string, callback: (invoice: GixInvoice) => void) {
        let page = 1;
        Log.info(`Fetching invoices from ${startDate} to ${endDate} | Page: ${page}...`);
        let data = await this.fetchInvoices(startDate, endDate, page);
        Log.info(`Fetched ${data.content.length} invoices.`);

        while (data.lastPage === false) {
            for (let i = 0; i < data.content.length; i++) {
                Log.info(`Processing invoice ${i + 1} of ${data.content.length}...`);
                callback(data.content[i]);
            }

            page++;

            Log.info(`Fetching invoices from ${startDate} to ${endDate} | Page: ${page}...`);
            data = await this.fetchInvoices(startDate, endDate, page);
            Log.info(`Fetched ${data.content.length} invoices.`);
        }
    }

    public async forCustomers(startDate: string, endDate: string, callback: (customer: GixCustomer) => Promise<void>) {
        let page = 1;

        Log.info(`Fetching customers from ${startDate} to ${endDate}... | Page: ${page}`);
        let data = await this.fetchCustomers(startDate, endDate, page);
        Log.info(`Fetched ${data.length} customers.`);

        while (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                Log.info(`Processing customer ${i + 1} of ${data.length}...`);
                await callback(data[i]);
            }

            page++;

            Log.info(`Fetching customers from ${startDate} to ${endDate}... | Page: ${page}`);
            data = await this.fetchCustomers(startDate, endDate, page);
            Log.info(`Fetched ${data.length} customers.`);
        }
    }
}

export default new GixService();