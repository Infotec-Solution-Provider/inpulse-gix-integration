import * as dotenv from 'dotenv';
import { createPool, Pool, RowDataPacket } from "mysql2/promise";
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

        Log.info(`Fetched customer by ERP ID: ${erpId}`);

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

        Log.info(`Saving customer with id: ${customer.id}`);
        console.log(customer);

        await this.pool.execute(query, values);
    }

    private async saveCompany(connection: any, company: any) {
        if (!company) return;
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

    private async saveCustomer(connection: any, customer: any) {
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

    private async saveSeller(connection: any, seller: any) {
        if (!seller) return;
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

    private async saveParticipants(connection: any, participants: any[]) {
        if (!participants || participants.length === 0) return;
        const participantQuery = `
            INSERT INTO gix_nf_participantes (tipoPessoa, cnpjCpf, cnpjCpfCliente, nome, telefone, celular, email, sexo, tipoParticipanteCodigo, tipoParticipanteDescricao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                tipoPessoa = VALUES(tipoPessoa),
                cnpjCpf = VALUES(cnpjCpf),
                cnpjCpfCliente = VALUES(cnpjCpfCliente),
                nome = VALUES(nome),
                telefone = VALUES(telefone),
                celular = VALUES(celular),
                email = VALUES(email),
                sexo = VALUES(sexo),
                tipoParticipanteCodigo = VALUES(tipoParticipanteCodigo),
                tipoParticipanteDescricao = VALUES(tipoParticipanteDescricao)
        `;
        for (const participant of participants) {
            await connection.execute(participantQuery, [
                participant.tipoPessoa || null,
                participant.cnpjCpf || null,
                participant.cnpjCpfCliente || null,
                participant.nome || null,
                participant.telefone || null,
                participant.celular || null,
                participant.email || null,
                participant.sexo || null,
                participant.tipoParticipante.codigo || null,
                participant.tipoParticipante.descricao || null
            ]);
        }
    }

    private async saveRawInvoiceProducts(connection: any, invoiceId: string, products: any[]) {
        if (!products || products.length === 0) return;
        const productQuery = `
            INSERT INTO gix_nf_produtos (numeroNf, codigoBarras, codigoInterno, codigoFabrica, codigoReferencia, descricao, precoUnitario, unidadeMedida, quantidade, descontoTotal, valorLiquido, valorIpi, valorST, valorFrete, valorSeguro, valorOutras, valorTotal, categoria, fabricante, marca, tipo, subtipo, subtipoDescricao, linha, linhaDescricao, familia, familiaDescricao, cor, corDescricao, exclusivoCd, situacao, fornecedor, operacao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                codigoBarras = VALUES(codigoBarras),
                codigoInterno = VALUES(codigoInterno),
                codigoFabrica = VALUES(codigoFabrica),
                codigoReferencia = VALUES(codigoReferencia),
                descricao = VALUES(descricao),
                precoUnitario = VALUES(precoUnitario),
                unidadeMedida = VALUES(unidadeMedida),
                quantidade = VALUES(quantidade),
                descontoTotal = VALUES(descontoTotal),
                valorLiquido = VALUES(valorLiquido),
                valorIpi = VALUES(valorIpi),
                valorST = VALUES(valorST),
                valorFrete = VALUES(valorFrete),
                valorSeguro = VALUES(valorSeguro),
                valorOutras = VALUES(valorOutras),
                valorTotal = VALUES(valorTotal),
                categoria = VALUES(categoria),
                fabricante = VALUES(fabricante),
                marca = VALUES(marca),
                tipo = VALUES(tipo),
                subtipo = VALUES(subtipo),
                subtipoDescricao = VALUES(subtipoDescricao),
                linha = VALUES(linha),
                linhaDescricao = VALUES(linhaDescricao),
                familia = VALUES(familia),
                familiaDescricao = VALUES(familiaDescricao),
                cor = VALUES(cor),
                corDescricao = VALUES(corDescricao),
                exclusivoCd = VALUES(exclusivoCd),
                situacao = VALUES(situacao),
                fornecedor = VALUES(fornecedor),
                operacao = VALUES(operacao)
        `;
        for (const product of products) {
            await connection.execute(productQuery, [
                invoiceId,
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

    public async saveRawInvoice(invoice: GixInvoice) {
        const maxRetries = 3;
        let attempt = 0;
        while (attempt < maxRetries) {
            const connection = await this.pool.getConnection();
            try {
                await connection.beginTransaction();

                if (invoice.empresaNota) {
                    await this.saveCompany(connection, invoice.empresaNota);
                }
                if (invoice.empresaOrigem) {
                    await this.saveCompany(connection, invoice.empresaOrigem);
                }
                Log.info(`Saved companies for invoice: ${invoice.numeroNF}`);

                if (invoice.cliente) {
                    await this.saveCustomer(connection, invoice.cliente);
                }
                Log.info(`Saved customer for invoice: ${invoice.numeroNF}`);

                if (invoice.vendedor) {
                    await this.saveSeller(connection, invoice.vendedor);
                }
                Log.info(`Saved seller for invoice: ${invoice.numeroNF}`);

                const invoiceQuery = `
                    INSERT INTO gix_nf (empresaNotaCodigo, empresaOrigemCodigo, clienteCodigo, vendedorCodigo, data, hora, numeroNF, serieNF, condicaoPagamento, descricaoCondicaoPagamento, cartoes, chaveNFE, tipoNota, valorProdutos, valorDesconto, valorIPI, valorST, valorFrete, valorOutras, valorSeguro, numeroItens, formaDePagamento, rentabilidadeTotal, codigoPedido)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        empresaNotaCodigo = VALUES(empresaNotaCodigo),
                        empresaOrigemCodigo = VALUES(empresaOrigemCodigo),
                        clienteCodigo = VALUES(clienteCodigo),
                        vendedorCodigo = VALUES(vendedorCodigo),
                        data = VALUES(data),
                        hora = VALUES(hora),
                        numeroNF = VALUES(numeroNF),
                        serieNF = VALUES(serieNF),
                        condicaoPagamento = VALUES(condicaoPagamento),
                        descricaoCondicaoPagamento = VALUES(descricaoCondicaoPagamento),
                        cartoes = VALUES(cartoes),
                        chaveNFE = VALUES(chaveNFE),
                        tipoNota = VALUES(tipoNota),
                        valorProdutos = VALUES(valorProdutos),
                        valorDesconto = VALUES(valorDesconto),
                        valorIPI = VALUES(valorIPI),
                        valorST = VALUES(valorST),
                        valorFrete = VALUES(valorFrete),
                        valorOutras = VALUES(valorOutras),
                        valorSeguro = VALUES(valorSeguro),
                        numeroItens = VALUES(numeroItens),
                        formaDePagamento = VALUES(formaDePagamento),
                        rentabilidadeTotal = VALUES(rentabilidadeTotal),
                        codigoPedido = VALUES(codigoPedido)
                `;
                await connection.execute(invoiceQuery, [
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
                    invoice.codigoPedido || null
                ]);
                Log.info(`Saved invoice: ${invoice.numeroNF}`);

                if (invoice.participantes && invoice.participantes.length > 0) {
                    await this.saveParticipants(connection, invoice.participantes);
                }
                Log.info(`Saved participants for invoice: ${invoice.numeroNF}`);

                if (invoice.produtos && invoice.produtos.length > 0) {
                    await this.saveRawInvoiceProducts(connection, invoice.numeroNF, invoice.produtos);
                }
                Log.info(`Saved products for invoice: ${invoice.numeroNF}`);

                await connection.commit();
                Log.info(`Transaction committed for invoice: ${invoice.numeroNF}`);
                break; // Exit the retry loop if successful
            } catch (error: any) {
                await connection.rollback();
                Log.error(`Transaction rolled back for invoice: ${invoice.numeroNF} due to error: ${error.message}`);
                if (error.code === 'ER_LOCK_DEADLOCK') {
                    attempt++;
                    Log.error(`Deadlock detected. Retrying transaction... Attempt ${attempt} of ${maxRetries}`);
                    if (attempt >= maxRetries) {
                        throw new Error(`Failed to save invoice after ${maxRetries} attempts due to deadlock.`);
                    }
                } else {
                    throw error;
                }
            } finally {
                connection.release();
                Log.info(`Connection released for invoice: ${invoice.numeroNF}`);
            }
        }
    }
}

export default new InpulseService();