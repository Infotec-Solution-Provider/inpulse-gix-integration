import * as dotenv from 'dotenv';
import axios, { AxiosError, AxiosInstance } from "axios";
import { GixInvoice } from "../types/GixInvoice";
import { GixCustomer } from "../types/GixCustomer";
import { GixInvoiceResponse } from "../types/GixInvoiceResponse";
import Log from '../utils/log';
import GixDate from '../utils/gix-date';

class GixService {
    private api: AxiosInstance;
    private cnpjs = ["07665018000151", "07665018000232", "07665018000313", "07665018000402"];

    constructor() {
        dotenv.config();

        const authBuffer = Buffer.from(`${process.env.GIX_API_USER}:${process.env.GIX_API_PASSWORD}`).toString('base64');
        const authString = `Basic ${authBuffer}`;

        this.api = axios.create({
            baseURL: process.env.GIX_API_URL,
            headers: { Authorization: authString }
        });

        this.api.interceptors.response.use(
            response => response,
            (error: AxiosError) => {
                if (error.response) {
                    return Promise.reject(new Error(`Erro na resposta da API: ${error.response.status} - ${(error.response.data as any)?.messages?.[0]}`));
                }
                if (error.request) {
                    return Promise.reject(new Error(`Erro na requisição para a API: ${error.message}`));
                }

                return Promise.reject(new Error(`Erro ao configurar a requisição para a API: ${error.message}`));
            }
        );
    }

    private async fetchInvoices(date: string, page: number): Promise<GixInvoiceResponse | Error> {
        dotenv.config();

        const url = "/shx-integracao-servicos/notas";
        const body = {
            dataInicial: date,
            dataFinal: date,
            paginacao: page,
            incluirCanceladas: "NAO"
        };

        try {
            Log.info(`Buscando faturas da página ${page}...`);
            const data = (await this.api.post<GixInvoiceResponse>(url, body)).data;
            data.content = data.content.filter(invoice => this.cnpjs.includes(invoice.empresaNota.cnpj) || this.cnpjs.includes(invoice.empresaOrigem.cnpj));
            Log.info(data.content.length > 0 ? `${data.content.length} faturas encontradas!` : 'Nenhuma fatura encontrada...');

            return data;
        } catch (error: any) {
            Log.error(`Erro ao buscar faturas da página ${page}`);

            return new Error(error.message);
        }
    }

    private async fetchCustomers(date: string, page: number): Promise<GixCustomer[] | Error> {
        dotenv.config();

        const url = "/shx-integracao-servicos/clientes";
        const params = {
            dataInicial: date,
            dataFinal: date,
            paginacao: page,
        };

        try {
            Log.info(`Buscando clientes da página ${page}...`);
            const data = (await this.api.get<Array<GixCustomer>>(url, { params })).data;
            Log.info(data.length > 0 ? `${data.length} clientes encontrados!` : 'Nenhum cliente encontrado...');

            return data;
        } catch (error: any) {
            Log.error(`Erro ao buscar clientes da página ${page}`);

            return new Error(error.message);
        }
    }

    public async forInvoices(date: GixDate, callback: (invoice: GixInvoice) => Promise<void>) {
        let page = 1;
        let data = await this.fetchInvoices(date.toGixString(), page);
        let lastPage = false;
        let errCount = 0;

        while (lastPage === false) {
            if (!(data instanceof Error)) {
                for (let i = 0; i < data.content.length; i++) {
                    await callback(data.content[i]);
                }
            }

            page++;
            data = await this.fetchInvoices(date.toGixString(), page);
            lastPage = !(data instanceof Error) ? data.lastPage : false;

            if (data instanceof Error) errCount++;
            if (errCount >= 2) throw data;
        }
    }

    public async forCustomers(date: GixDate, callback: (customer: GixCustomer) => Promise<void>) {
        let page = 1;
        let data = await this.fetchCustomers(date.toGixString(), page);
        let errCount = 0;

        while (data instanceof Error || data.length > 0) {
            if (!(data instanceof Error)) {
                for (let i = 0; i < data.length; i++) {
                    await callback(data[i]);
                }
            }

            page++;
            data = await this.fetchCustomers(date.toGixString(), page);

            if (data instanceof Error) errCount++;
            if (errCount >= 2) throw data;
        }
    }
}

export default new GixService();