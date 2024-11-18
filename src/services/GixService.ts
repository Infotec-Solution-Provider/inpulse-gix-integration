import * as dotenv from 'dotenv';
import axios, { AxiosInstance } from "axios";
import { GixInvoice } from "../types/GixInvoice";
import { GixCustomer } from "../types/GixCustomer";
import { GixInvoiceResponse } from "../types/GixInvoiceResponse";

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
        let data = await this.fetchInvoices(startDate, endDate, page);

        while (data.lastPage === false) {
            for (const invoice of data.content) {
                callback(invoice);
            }

            page++;
            data = await this.fetchInvoices(startDate, endDate, page);
        }
    }

    public async forCustomers(startDate: string, endDate: string, callback: (customer: GixCustomer) => Promise<void>) {
        let page = 1;
        let data = await this.fetchCustomers(startDate, endDate, page);

        while (data.length > 0) {
            for (const customer of data) {
                await callback(customer);
            }

            page++;
            data = await this.fetchCustomers(startDate, endDate, page);
        }
    }
}

export default new GixService();