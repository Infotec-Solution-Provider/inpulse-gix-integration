export type GixInvoiceParticipant = {
    tipoPessoa: string;
    cnpjCpf: string;
    cnpjCpfCliente: string;
    nome: string;
    telefone: string;
    celular: string;
    email: string;
    sexo: string;
    tipoParticipante: {
        codigo: string;
        descricao: string;
    };
};