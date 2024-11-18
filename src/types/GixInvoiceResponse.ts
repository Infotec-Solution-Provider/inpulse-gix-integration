import { GixInvoice } from "./GixInvoice";

export type GixInvoiceResponse = {
    content: Array<GixInvoice>;
    total: number;
    lastPage: boolean;
};