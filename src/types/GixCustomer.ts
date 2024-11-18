export type GixCustomer = {
    nome: string;
    cpfCnpj: string;
    tipoPessoa: "JURÍDICA" | "FÍSICA";
    telefone: string;
    celular: string;
    cep: string;
    email: string;
    endereco: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
    id: number;
    inscrEstadual: string;
    nomeReduzido: string;
    tipoCadastro: string;
    dataAtualizacao: string;
    tipoCliente: {
        codigo: string;
        descricao: string;
    }
}