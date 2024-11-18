import * as dotenv from 'dotenv';
import { createPool, Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { GixCustomer } from '../types/GixCustomer';
import { GixInvoice } from '../types/GixInvoice';

class InpulseService {
    private pool: Pool;

    constructor() {
        dotenv.config();

        this.pool = createPool({
            host: process.env.INPULSE_DB_HOST,
            user: process.env.INPULSE_DB_USER,
            password: process.env.INPULSE_DB_PASSWORD,
            database: process.env.INPULSE_DB_NAME
        });
    }

    public async getCustomerByErpId(erpId: string) {
        const query = "SELECT CODIGO FROM clientes WHERE CODIGO_ERP = ?";
        const [result] = await this.pool.query<RowDataPacket[]>(query, [erpId]);
        const customer = result[0] as { CODIGO: number };

        return customer;
    }

    public async saveRawCustomer(customer: GixCustomer) {
        const query = `
        INSERT INTO gix_clientes (id, nome, cpfCnpj, tipoPessoa, telefone, celular, cep, email, endereco, bairro, cidade, estado, pais, inscrEstadual, nomeReduzido, tipoCadastro, dataAtualizacao, tipoClienteCodigo, tipoClienteDescricao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            nome = VALUES(nome),
            cpfCnpj = VALUES(cpfCnpj),
            tipoPessoa = VALUES(tipoPessoa),
            telefone = VALUES(telefone),
            celular = VALUES(celular),
            cep = VALUES(cep),
            email = VALUES(email),
            endereco = VALUES(endereco),
            bairro = VALUES(bairro),
            cidade = VALUES(cidade),
            estado = VALUES(estado),
            pais = VALUES(pais),
            inscrEstadual = VALUES(inscrEstadual),
            nomeReduzido = VALUES(nomeReduzido),
            tipoCadastro = VALUES(tipoCadastro),
            dataAtualizacao = VALUES(dataAtualizacao),
            tipoClienteCodigo = VALUES(tipoClienteCodigo),
            tipoClienteDescricao = VALUES(tipoClienteDescricao)
    `;

        await this.pool.execute(query, [
            customer.id,
            customer.nome,
            customer.cpfCnpj,
            customer.tipoPessoa,
            customer.telefone,
            customer.celular,
            customer.cep,
            customer.email,
            customer.endereco,
            customer.bairro,
            customer.cidade,
            customer.estado,
            customer.pais,
            customer.inscrEstadual,
            customer.nomeReduzido,
            customer.tipoCadastro,
            customer.dataAtualizacao,
            customer.tipoCliente.codigo,
            customer.tipoCliente.descricao
        ]);
    }

    public async saveRawInvoice(invoice: GixInvoice) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();

            // Save company
            const companyQuery = `
                INSERT INTO gix_nf_empresas (codigo, nome, cnpj)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    nome = VALUES(nome),
                    cnpj = VALUES(cnpj)
            `;
            await connection.execute(companyQuery, [
                invoice.empresaNota.codigo,
                invoice.empresaNota.nome,
                invoice.empresaNota.cnpj
            ]);
            await connection.execute(companyQuery, [
                invoice.empresaOrigem.codigo,
                invoice.empresaOrigem.nome,
                invoice.empresaOrigem.cnpj
            ]);

            // Save customer
            const customerQuery = `
                INSERT INTO gix_nf_clientes (codigo, tipoPessoa, cnpjCpf, nome, celular, email, sexo, dataNascimento, profissao, dataCadastro, dataUltimaCompra, tipo, descricaoTipo, subTipo, descricaoSubTipo, endereco, bairro, cidade, estado, cep, complemento)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    tipoPessoa = VALUES(tipoPessoa),
                    cnpjCpf = VALUES(cnpjCpf),
                    nome = VALUES(nome),
                    celular = VALUES(celular),
                    email = VALUES(email),
                    sexo = VALUES(sexo),
                    dataNascimento = VALUES(dataNascimento),
                    profissao = VALUES(profissao),
                    dataCadastro = VALUES(dataCadastro),
                    dataUltimaCompra = VALUES(dataUltimaCompra),
                    tipo = VALUES(tipo),
                    descricaoTipo = VALUES(descricaoTipo),
                    subTipo = VALUES(subTipo),
                    descricaoSubTipo = VALUES(descricaoSubTipo),
                    endereco = VALUES(endereco),
                    bairro = VALUES(bairro),
                    cidade = VALUES(cidade),
                    estado = VALUES(estado),
                    cep = VALUES(cep),
                    complemento = VALUES(complemento)
            `;
            await connection.execute(customerQuery, [
                invoice.cliente.codigo,
                invoice.cliente.tipoPessoa,
                invoice.cliente.cnpjCpf,
                invoice.cliente.nome,
                invoice.cliente.celular,
                invoice.cliente.email,
                invoice.cliente.sexo,
                invoice.cliente.dataNascimento,
                invoice.cliente.profissao,
                invoice.cliente.dataCadastro,
                invoice.cliente.dataUltimaCompra,
                invoice.cliente.tipo,
                invoice.cliente.descricaoTipo,
                invoice.cliente.subTipo,
                invoice.cliente.descricaoSubTipo,
                invoice.cliente.endereco,
                invoice.cliente.bairro,
                invoice.cliente.cidade,
                invoice.cliente.estado,
                invoice.cliente.cep,
                invoice.cliente.complemento
            ]);

            // Save seller
            const sellerQuery = `
                INSERT INTO gix_nf_vendedores (codigo, cnpjCpf, nome, tipo, tipoDescricao, gerente, gerenteDescricao, ativoInativo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    cnpjCpf = VALUES(cnpjCpf),
                    nome = VALUES(nome),
                    tipo = VALUES(tipo),
                    tipoDescricao = VALUES(tipoDescricao),
                    gerente = VALUES(gerente),
                    gerenteDescricao = VALUES(gerenteDescricao),
                    ativoInativo = VALUES(ativoInativo)
            `;
            await connection.execute(sellerQuery, [
                invoice.vendedor.codigo,
                invoice.vendedor.cnpjCpf,
                invoice.vendedor.nome,
                invoice.vendedor.tipo,
                invoice.vendedor.tipoDescricao,
                invoice.vendedor.gerente,
                invoice.vendedor.gerenteDescricao,
                invoice.vendedor.ativoInativo
            ]);

            // Save invoice
            const invoiceQuery = `
                INSERT INTO gix_nf (empresaNotaCodigo, empresaOrigemCodigo, clienteCodigo, vendedorCodigo, data, hora, numeroNF, serieNF, condicaoPagamento, descricaoCondicaoPagamento, cartoes, chaveNFE, tipoNota, valorProdutos, valorDesconto, valorIPI, valorST, valorFrete, valorOutras, valorSeguro, numeroItens, formaDePagamento, rentabilidadeTotal, codigoPedido)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await connection.execute(invoiceQuery, [
                invoice.empresaNota.codigo,
                invoice.empresaOrigem.codigo,
                invoice.cliente.codigo,
                invoice.vendedor.codigo,
                invoice.data,
                invoice.hora,
                invoice.numeroNF,
                invoice.serieNF,
                invoice.condicaoPagamento,
                invoice.descricaoCondicaoPagamento,
                invoice.cartoes,
                invoice.chaveNFE,
                invoice.tipoNota,
                invoice.valorProdutos,
                invoice.valorDesconto,
                invoice.valorIPI,
                invoice.valorST,
                invoice.valorFrete,
                invoice.valorOutras,
                invoice.valorSeguro,
                invoice.numeroItens,
                invoice.formaDePagamento,
                invoice.rentabilidadeTotal,
                invoice.codigoPedido
            ]);

            // Save participants
            const participantQuery = `
                INSERT INTO gix_nf_participantes (tipoPessoa, cnpjCpf, cnpjCpfCliente, nome, telefone, celular, email, sexo, tipoParticipanteCodigo, tipoParticipanteDescricao)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            for (const participant of invoice.participantes) {
                await connection.execute(participantQuery, [
                    participant.tipoPessoa,
                    participant.cnpjCpf,
                    participant.cnpjCpfCliente,
                    participant.nome,
                    participant.telefone,
                    participant.celular,
                    participant.email,
                    participant.sexo,
                    participant.tipoParticipante.codigo,
                    participant.tipoParticipante.descricao
                ]);
            }

            // Save products
            const productQuery = `
                INSERT INTO GixInvoiceProduct (codigoBarras, codigoInterno, codigoFabrica, codigoReferencia, descricao, precoUnitario, unidadeMedida, quantidade, descontoTotal, valorLiquido, valorIpi, valorST, valorFrete, valorSeguro, valorOutras, valorTotal, categoria, fabricante, marca, tipo, subtipo, subtipoDescricao, linha, linhaDescricao, familia, familiaDescricao, cor, corDescricao, exclusivoCd, situacao, fornecedor, operacao)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            for (const product of invoice.produtos) {
                await connection.execute(productQuery, [
                    product.codigoBarras,
                    product.codigoInterno,
                    product.codigoFabrica,
                    product.codigoReferencia,
                    product.descricao,
                    product.precoUnitario,
                    product.unidadeMedida,
                    product.quantidade,
                    product.descontoTotal,
                    product.valorLiquido,
                    product.valorIpi,
                    product.valorST,
                    product.valorFrete,
                    product.valorSeguro,
                    product.valorOutras,
                    product.valorTotal,
                    product.categoria,
                    product.fabricante,
                    product.marca,
                    product.tipo,
                    product.subtipo,
                    product.subtipoDescricao,
                    product.linha,
                    product.linhaDescricao,
                    product.familia,
                    product.familiaDescricao,
                    product.cor,
                    product.corDescricao,
                    product.exclusivoCd,
                    product.situacao,
                    product.fornecedor,
                    product.operacao
                ]);
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default new InpulseService();