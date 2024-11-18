import * as dotenv from 'dotenv';
import { createPool, Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { GixCustomer } from '../types/GixCustomer';
import { GixInvoice } from '../types/GixInvoice';
import Log from '../utils/log';

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

        Log.info('Inpulse database connection pool created.');
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

        console.log(customer)

        await this.pool.execute(query, [
            customer.id,
            customer.nome,
            customer.cpfCnpj,
            customer.tipoPessoa || null,
            customer.telefone || null,
            customer.celular || null,
            customer.cep || null,
            customer.email || null,
            customer.endereco || null,
            customer.bairro || null,
            customer.cidade || null,
            customer.estado || null,
            customer.pais || null,
            customer.inscrEstadual || null,
            customer.nomeReduzido || null,
            customer.tipoCadastro || null,
            customer.dataAtualizacao || null,
            customer.tipoCliente?.codigo || null,
            customer.tipoCliente?.descricao || null
        ]);
    }

    private async saveRawInvoiceCompany(connection: any, company: any) {
        const companyQuery = `
            INSERT INTO gix_nf_empresas (codigo, nome, cnpj)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                nome = VALUES(nome),
                cnpj = VALUES(cnpj)
        `;
        await connection.execute(companyQuery, [
            company.codigo,
            company.nome,
            company.cnpj
        ]);
    }

    private async saveRawInvoiceCustomer(connection: any, customer: any) {
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
            customer.codigo,
            customer.tipoPessoa,
            customer.cnpjCpf,
            customer.nome,
            customer.celular || null,
            customer.email || null,
            customer.sexo || null,
            customer.dataNascimento || null,
            customer.profissao || null,
            customer.dataCadastro || null,
            customer.dataUltimaCompra || null,
            customer.tipo || null,
            customer.descricaoTipo || null,
            customer.subTipo || null,
            customer.descricaoSubTipo || null,
            customer.endereco || null,
            customer.bairro || null,
            customer.cidade || null,
            customer.estado || null,
            customer.cep || null,
            customer.complemento || null
        ]);
    }

    private async saveRawInvoiceSeller(connection: any, seller: any) {
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
            seller.codigo,
            seller.cnpjCpf,
            seller.nome,
            seller.tipo || null,
            seller.tipoDescricao || null,
            seller.gerente || null,
            seller.gerenteDescricao || null,
            seller.ativoInativo || null
        ]);
    }

    private async saveParticipants(connection: any, participants: any[]) {
        const participantQuery = `
            INSERT INTO gix_nf_participantes (tipoPessoa, cnpjCpf, cnpjCpfCliente, nome, telefone, celular, email, sexo, tipoParticipanteCodigo, tipoParticipanteDescricao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        for (const participant of participants) {
            await connection.execute(participantQuery, [
                participant.tipoPessoa,
                participant.cnpjCpf,
                participant.cnpjCpfCliente,
                participant.nome,
                participant.telefone || null,
                participant.celular || null,
                participant.email || null,
                participant.sexo || null,
                participant.tipoParticipante.codigo,
                participant.tipoParticipante.descricao
            ]);
        }
    }

    private async saveProducts(connection: any, products: any[]) {
        const productQuery = `
            INSERT INTO GixInvoiceProduct (codigoBarras, codigoInterno, codigoFabrica, codigoReferencia, descricao, precoUnitario, unidadeMedida, quantidade, descontoTotal, valorLiquido, valorIpi, valorST, valorFrete, valorSeguro, valorOutras, valorTotal, categoria, fabricante, marca, tipo, subtipo, subtipoDescricao, linha, linhaDescricao, familia, familiaDescricao, cor, corDescricao, exclusivoCd, situacao, fornecedor, operacao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        for (const product of products) {
            await connection.execute(productQuery, [
                product.codigoBarras,
                product.codigoInterno,
                product.codigoFabrica || null,
                product.codigoReferencia || null,
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
                product.categoria || null,
                product.fabricante || null,
                product.marca || null,
                product.tipo || null,
                product.subtipo || null,
                product.subtipoDescricao || null,
                product.linha || null,
                product.linhaDescricao || null,
                product.familia || null,
                product.familiaDescricao || null,
                product.cor || null,
                product.corDescricao || null,
                product.exclusivoCd || null,
                product.situacao || null,
                product.fornecedor || null,
                product.operacao || null
            ]);
        }
    }

    public async saveRawInvoice(invoice: GixInvoice) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();

            await this.saveRawInvoiceCompany(connection, invoice.empresaNota);
            await this.saveRawInvoiceCompany(connection, invoice.empresaOrigem);
            Log.info(`Saved companies for invoice: ${invoice.numeroNF}`);

            await this.saveRawInvoiceCustomer(connection, invoice.cliente);
            Log.info(`Saved customer for invoice: ${invoice.numeroNF}`);

            await this.saveRawInvoiceSeller(connection, invoice.vendedor);
            Log.info(`Saved seller for invoice: ${invoice.numeroNF}`);

            const saveInvoiceQuery = `
                INSERT INTO gix_nf (empresaNotaCodigo, empresaOrigemCodigo, clienteCodigo, vendedorCodigo, data, hora, numeroNF, serieNF, condicaoPagamento, descricaoCondicaoPagamento, cartoes, chaveNFE, tipoNota, valorProdutos, valorDesconto, valorIPI, valorST, valorFrete, valorOutras, valorSeguro, numeroItens, formaDePagamento, rentabilidadeTotal, codigoPedido)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await connection.execute(saveInvoiceQuery, [
                invoice.empresaNota.codigo,
                invoice.empresaOrigem.codigo,
                invoice.cliente.codigo,
                invoice.vendedor.codigo,
                invoice.data,
                invoice.hora,
                invoice.numeroNF,
                invoice.serieNF,
                invoice.condicaoPagamento || null,
                invoice.descricaoCondicaoPagamento || null,
                invoice.cartoes || null,
                invoice.chaveNFE || null,
                invoice.tipoNota || null,
                invoice.valorProdutos,
                invoice.valorDesconto,
                invoice.valorIPI,
                invoice.valorST,
                invoice.valorFrete,
                invoice.valorOutras,
                invoice.valorSeguro,
                invoice.numeroItens,
                invoice.formaDePagamento || null,
                invoice.rentabilidadeTotal || null,
                invoice.codigoPedido
            ]);
            Log.info(`Saved invoice: ${invoice.numeroNF}`);

            await this.saveParticipants(connection, invoice.participantes);
            Log.info(`Saved participants for invoice: ${invoice.numeroNF}`);

            await this.saveProducts(connection, invoice.produtos);
            Log.info(`Saved products for invoice: ${invoice.numeroNF}`);

            await connection.commit();
            Log.info(`Transaction committed for invoice: ${invoice.numeroNF}`);
        } catch (error: any) {
            await connection.rollback();
            Log.error(`Transaction rolled back for invoice: ${invoice.numeroNF} due to error: ${error.message}`);
            throw error;
        } finally {
            connection.release();
            Log.info(`Connection released for invoice: ${invoice.numeroNF}`);
        }
    }
}

export default new InpulseService();