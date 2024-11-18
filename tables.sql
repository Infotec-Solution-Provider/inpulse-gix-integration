CREATE TABLE gix_cliente (
    id INT(11) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cpfCnpj VARCHAR(255) NOT NULL,
    tipoPessoa ENUM('JURÍDICA', 'FÍSICA') NOT NULL,
    telefone VARCHAR(255) NOT NULL,
    celular VARCHAR(255) NOT NULL,
    cep VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    bairro VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    estado VARCHAR(255) NOT NULL,
    pais VARCHAR(255) NOT NULL,
    inscrEstadual VARCHAR(255) NOT NULL,
    nomeReduzido VARCHAR(255) NOT NULL,
    tipoCadastro VARCHAR(255) NOT NULL,
    dataAtualizacao DATE NOT NULL,
    tipoClienteCodigo VARCHAR(255) NOT NULL,
    tipoClienteDescricao VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE gix_nf_empresas (
    codigo INT(11) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(255) NOT NULL,
    PRIMARY KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE gix_nf_clientes (
    codigo INT(11) NOT NULL,
    tipoPessoa VARCHAR(255) NOT NULL,
    cnpjCpf VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    celular VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    sexo VARCHAR(10) NOT NULL,
    dataNascimento DATE NOT NULL,
    profissao VARCHAR(255) NOT NULL,
    dataCadastro DATE NOT NULL,
    dataUltimaCompra DATE NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    descricaoTipo VARCHAR(255) NOT NULL,
    subTipo VARCHAR(255) NOT NULL,
    descricaoSubTipo VARCHAR(255) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    bairro VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    estado VARCHAR(255) NOT NULL,
    cep VARCHAR(20) NOT NULL,
    complemento VARCHAR(255) NOT NULL,
    PRIMARY KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE gix_nf_participantes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    tipoPessoa VARCHAR(255) NOT NULL,
    cnpjCpf VARCHAR(255) NOT NULL,
    cnpjCpfCliente VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(255) NOT NULL,
    celular VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    sexo VARCHAR(10) NOT NULL,
    tipoParticipanteCodigo VARCHAR(255) NOT NULL,
    tipoParticipanteDescricao VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE gix_nf_produtos (
    id INT(11) NOT NULL AUTO_INCREMENT,
    codigoBarras VARCHAR(255) NOT NULL,
    codigoInterno VARCHAR(255) NOT NULL,
    codigoFabrica VARCHAR(255) NOT NULL,
    codigoReferencia VARCHAR(255) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    precoUnitario DOUBLE NOT NULL,
    unidadeMedida VARCHAR(255) NOT NULL,
    quantidade INT(11) NOT NULL,
    descontoTotal DOUBLE NOT NULL,
    valorLiquido DOUBLE NOT NULL,
    valorIpi DOUBLE NOT NULL,
    valorST DOUBLE NOT NULL,
    valorFrete DOUBLE NOT NULL,
    valorSeguro DOUBLE NOT NULL,
    valorOutras DOUBLE NOT NULL,
    valorTotal DOUBLE NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    fabricante VARCHAR(255) NOT NULL,
    marca VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    subtipo VARCHAR(255) NOT NULL,
    subtipoDescricao VARCHAR(255) NOT NULL,
    linha VARCHAR(255) NOT NULL,
    linhaDescricao VARCHAR(255) NOT NULL,
    familia VARCHAR(255) NOT NULL,
    familiaDescricao VARCHAR(255) NOT NULL,
    cor VARCHAR(255) NOT NULL,
    corDescricao VARCHAR(255) NOT NULL,
    exclusivoCd VARCHAR(255) NOT NULL,
    situacao VARCHAR(255) NOT NULL,
    fornecedor VARCHAR(255) NOT NULL,
    operacao VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE gix_nf_vendedores (
    codigo VARCHAR(255) NOT NULL,
    cnpjCpf VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    tipoDescricao VARCHAR(255) NOT NULL,
    gerente VARCHAR(255) NOT NULL,
    gerenteDescricao VARCHAR(255) NOT NULL,
    ativoInativo VARCHAR(255) NOT NULL,
    PRIMARY KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE gix_nf (
    id INT(11) NOT NULL AUTO_INCREMENT,
    empresaNotaCodigo INT(11) NOT NULL,
    empresaOrigemCodigo INT(11) NOT NULL,
    clienteCodigo INT(11) NOT NULL,
    vendedorCodigo VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    numeroNF VARCHAR(255) NOT NULL,
    serieNF VARCHAR(255) NOT NULL,
    condicaoPagamento VARCHAR(255) NOT NULL,
    descricaoCondicaoPagamento VARCHAR(255) NOT NULL,
    cartoes VARCHAR(255) NOT NULL,
    chaveNFE VARCHAR(255) NOT NULL,
    tipoNota VARCHAR(255) NOT NULL,
    valorProdutos DOUBLE NOT NULL,
    valorDesconto DOUBLE NOT NULL,
    valorIPI DOUBLE NOT NULL,
    valorST DOUBLE NOT NULL,
    valorFrete DOUBLE NOT NULL,
    valorOutras DOUBLE NOT NULL,
    valorSeguro DOUBLE NOT NULL,
    numeroItens INT(11) NOT NULL,
    formaDePagamento VARCHAR(255) NOT NULL,
    rentabilidadeTotal VARCHAR(255) NOT NULL,
    codigoPedido INT(11) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (empresaNotaCodigo) REFERENCES GixInvoiceCompany(codigo),
    FOREIGN KEY (empresaOrigemCodigo) REFERENCES GixInvoiceCompany(codigo),
    FOREIGN KEY (clienteCodigo) REFERENCES GixInvoiceCustomer(codigo),
    FOREIGN KEY (vendedorCodigo) REFERENCES GixInvoiceSeller(codigo)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;