import * as dotenv from 'dotenv';
import { createPool, Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { GixCustomer } from '../types/GixCustomer';
import { GixInvoice } from '../types/GixInvoice';
import Log from '../utils/log';
import DatabaseService from './DatabaseService';

class InpulseService {
    private pool: Pool;

    constructor(dbService: typeof DatabaseService) {
        this.pool = dbService.pool;
    }

    public async getCustomerByErpId(erpId: string) {
        const query = "SELECT CODIGO FROM clientes WHERE CODIGO_ERP = ?";
        const [result] = await this.pool.query<RowDataPacket[]>(query, [erpId]);
        const customer = result[0] as { CODIGO: number };

        return customer;
    }

    public async saveGixCustomer(customer: GixCustomer) {
        try {
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

            const values = [
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
            ];

            await this.pool.execute(query, values);
        } catch (error: any) {
            Log.error(`Falha ao salvar cliente id: ${customer.id} | ${error?.message}`, error);
        }
    }

    private async saveGixInvoiceCustomer(connection: any, customer: any) {
        if (!customer) return;
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
            customer.codigo || null,
            customer.tipoPessoa || null,
            customer.cnpjCpf || null,
            customer.nome || null,
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

    private async saveGixInvoiceSeller(connection: any, seller: any) {
        if (!seller) return;
        if (!seller.codigo || seller.codigo.length === 0) return;

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
            seller.codigo || null,
            seller.cnpjCpf || null,
            seller.nome || null,
            seller.tipo || null,
            seller.tipoDescricao || null,
            seller.gerente || null,
            seller.gerenteDescricao || null,
            seller.ativoInativo || null
        ]);
    }

    private async saveGixInvoiceProducts(connection: any, invoiceId: number, invoiceNumber: string, products: any[]) {
        if (!products || products.length === 0) return;
        const productQuery = `
            INSERT INTO gix_nf_produtos (idNf, numeroNf, codigoBarras, codigoInterno, codigoFabrica, codigoReferencia, descricao, precoUnitario, unidadeMedida, quantidade, descontoTotal, valorLiquido, valorIpi, valorST, valorFrete, valorSeguro, valorOutras, valorTotal, categoria, fabricante, marca, tipo, subtipo, subtipoDescricao, linha, linhaDescricao, familia, familiaDescricao, cor, corDescricao, exclusivoCd, situacao, fornecedor, operacao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        for (const product of products) {
            await connection.execute(productQuery, [
                invoiceId,
                invoiceNumber,
                product.codigoBarras || null,
                product.codigoInterno || null,
                product.codigoFabrica || null,
                product.codigoReferencia || null,
                product.descricao || null,
                product.precoUnitario || null,
                product.unidadeMedida || null,
                product.quantidade || null,
                product.descontoTotal || null,
                product.valorLiquido || null,
                product.valorIpi || null,
                product.valorST || null,
                product.valorFrete || null,
                product.valorSeguro || null,
                product.valorOutras || null,
                product.valorTotal || null,
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

    public async saveGixInvoice(invoice: GixInvoice) {
        try {
            const connection = await this.pool.getConnection()
            try {
                await connection.beginTransaction();

                if (invoice.cliente) {
                    await this.saveGixInvoiceCustomer(connection, invoice.cliente);
                }

                if (invoice.vendedor) {
                    await this.saveGixInvoiceSeller(connection, invoice.vendedor);
                }

                const invoiceQuery = `
                    INSERT INTO gix_nf (empresaNotaCodigo, empresaOrigemCodigo, clienteCodigo, vendedorCodigo, data, hora, numeroNF, serieNF, condicaoPagamento, descricaoCondicaoPagamento, cartoes, chaveNFE, tipoNota, valorProdutos, valorDesconto, valorIPI, valorST, valorFrete, valorOutras, valorSeguro, numeroItens, formaDePagamento, rentabilidadeTotal, codigoPedido, empresaNota, empresaOrigem)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const [result]: [ResultSetHeader, unknown] = await connection.execute(invoiceQuery, [
                    invoice.empresaNota?.codigo || null,
                    invoice.empresaOrigem?.codigo || null,
                    invoice.cliente?.codigo || null,
                    invoice.vendedor?.codigo || null,
                    invoice.data || null,
                    invoice.hora || null,
                    invoice.numeroNF || null,
                    invoice.serieNF || null,
                    invoice.condicaoPagamento || null,
                    invoice.descricaoCondicaoPagamento || null,
                    invoice.cartoes || null,
                    invoice.chaveNFE || null,
                    invoice.tipoNota || null,
                    invoice.valorProdutos || null,
                    invoice.valorDesconto || null,
                    invoice.valorIPI || null,
                    invoice.valorST || null,
                    invoice.valorFrete || null,
                    invoice.valorOutras || null,
                    invoice.valorSeguro || null,
                    invoice.numeroItens || null,
                    invoice.formaDePagamento || null,
                    invoice.rentabilidadeTotal || null,
                    invoice.codigoPedido || null,
                    invoice.empresaNota.cnpj,
                    invoice.empresaOrigem.cnpj
                ]);

                if (invoice.produtos && invoice.produtos.length > 0) {
                    await this.saveGixInvoiceProducts(connection, result.insertId, invoice.numeroNF, invoice.produtos);
                }

                await connection.commit();
            } catch (error: any) {
                await connection.rollback();

                Log.error(`Falha ao salvar fatura numero: ${invoice.numeroNF} | ${error?.message}`, error);
            } finally {
                connection.release();
            }
        } catch (error: any) {
            Log.error(`Falha ao salvar fatura numero: ${invoice.numeroNF} | ${error?.message}`, error);
        }
    }
}

export default new InpulseService(DatabaseService);