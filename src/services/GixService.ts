import * as dotenv from 'dotenv';
import axios, { AxiosInstance } from "axios";
import { GixInvoice } from "../types/GixInvoice";
import { GixCustomer } from "../types/GixCustomer";
import { GixInvoiceResponse } from "../types/GixInvoiceResponse";
import Log from '../utils/log';
import GixDate from '../utils/gix-date';

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
        const body = {
            dataInicial: startDate,
            dataFinal: endDate,
            paginacao: page,
            empresasOrigem: ["07665018000151", "07665018000232", "07665018000313", "07665018000402"],
            empresas: ["07665018000151", "07665018000232", "07665018000313", "07665018000402"],
        };

        Log.info(`Buscando faturas da página ${page}...`);
        const response = await this.api.post<GixInvoiceResponse>(url, body);
        Log.info(response.data.content.length > 0 ? `${response.data.content.length} faturas encontradas!` : 'Nenhuma fatura encontrada...');

        return response.data;
    }

    private async fetchCustomers(startDate: string, endDate: string, page: number) {
        const url = "/shx-integracao-servicos/clientes";
        const params = {
            dataOcorrencia: startDate,
            dataFim: endDate,
            pagina: page,
        };

        Log.info(`Buscando clientes da página ${page}...`);
        const response = await this.api.get<Array<GixCustomer>>(url, { params });
        Log.info(response.data.length > 0 ? `${response.data.length} clientes encontrados!` : 'Nenhum cliente encontrado...');

        return response.data;
    }

    public async forInvoices(startDate: string, endDate: string, callback: (invoice: GixInvoice) => Promise<void>) {
        let page = 1;
        let data = await this.fetchInvoices(startDate, endDate, page);

        while (data.lastPage === false) {
            for (let i = 0; i < data.content.length; i++) {
                await callback(data.content[i]);
            }

            page++;
            data = await this.fetchInvoices(startDate, endDate, page);
        }
    }

    public async forCustomers(startDate: GixDate, endDate: GixDate, callback: (customer: GixCustomer) => Promise<void>) {
        let page = 1;
        let data = await this.fetchCustomers(startDate.toGixString(), endDate.toGixString(), page);

        while (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                await callback(data[i]);
            }

            page++;
            data = await this.fetchCustomers(startDate.toGixString(), endDate.toGixString(), page);
        }
    }
}

export default new GixService();