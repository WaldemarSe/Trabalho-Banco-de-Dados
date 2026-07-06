CREATE SCHEMA feature_store;

CREATE TABLE feature_store.conta (
    id SERIAL,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL, 
    email VARCHAR(100) NOT NULL,
    e_admin BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_conta PRIMARY KEY (id),
    CONSTRAINT uk_conta_email UNIQUE (email),
    CONSTRAINT chk_conta_senha CHECK (LENGTH(senha) >= 6)
); 

CREATE TABLE feature_store.dataset (
    id SERIAL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255), 
    fontes VARCHAR(255), 
    dt_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    e_privado BOOLEAN NOT NULL DEFAULT TRUE,
    criador_id INT NOT NULL,
    CONSTRAINT fk_dataset_criador FOREIGN KEY (criador_id) 
        REFERENCES feature_store.conta(id) ON DELETE RESTRICT,
    CONSTRAINT pk_dataset PRIMARY KEY (id)
); 

CREATE TABLE feature_store.dataset_versao (
    id SERIAL,
    dataset_id INT NOT NULL,
    conta_id INT NOT NULL,
    versao_base_id INT,
    num_versao VARCHAR(20) NOT NULL,
    descricao_modificacoes VARCHAR(255),
    dt_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    arquivo_csv BYTEA NOT NULL,
    CONSTRAINT fk_dataset_versao_dataset FOREIGN KEY (dataset_id) 
        REFERENCES feature_store.dataset(id) ON DELETE CASCADE,
    CONSTRAINT fk_dataset_versao_conta FOREIGN KEY (conta_id) 
        REFERENCES feature_store.conta(id) ON DELETE RESTRICT,
    CONSTRAINT fk_dataset_versao_base FOREIGN KEY (versao_base_id) 
        REFERENCES feature_store.dataset_versao(id) ON DELETE CASCADE,
    CONSTRAINT pk_dataset_versao PRIMARY KEY (id),
    CONSTRAINT uk_dataset_versao_num UNIQUE (dataset_id, num_versao)
);

CREATE TABLE feature_store.feature (
    id SERIAL,
    versao_dataset_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    tipo VARCHAR(25),
    CONSTRAINT fk_feature_versao_dataset FOREIGN KEY (versao_dataset_id) 
        REFERENCES feature_store.dataset_versao(id) ON DELETE CASCADE,
    CONSTRAINT pk_feature PRIMARY KEY (id)
);

CREATE TABLE feature_store.visualizacao (
    id SERIAL,
    conta_id INT NOT NULL,
    versao_dataset_id INT NOT NULL,
    dt_e_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_visualizacao_conta FOREIGN KEY (conta_id) 
        REFERENCES feature_store.conta(id) ON DELETE RESTRICT,
    CONSTRAINT fk_visualizacao_versao_dataset FOREIGN KEY (versao_dataset_id) 
        REFERENCES feature_store.dataset_versao(id) ON DELETE CASCADE,
    CONSTRAINT pk_visualizacao PRIMARY KEY (id)
);

CREATE TABLE feature_store.download (
    id SERIAL,
    conta_id INT NOT NULL,
    versao_dataset_id INT NOT NULL,
    dt_e_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_download_conta FOREIGN KEY (conta_id) 
        REFERENCES feature_store.conta(id) ON DELETE RESTRICT,
    CONSTRAINT fk_download_versao_dataset FOREIGN KEY (versao_dataset_id) 
        REFERENCES feature_store.dataset_versao(id) ON DELETE CASCADE,
    CONSTRAINT pk_download PRIMARY KEY (id)
);

CREATE TABLE feature_store.trabalha_em (
    conta_id INT NOT NULL,
    dataset_id INT NOT NULL,
    CONSTRAINT fk_trabalha_conta FOREIGN KEY (conta_id) 
        REFERENCES feature_store.conta(id) ON DELETE CASCADE,
    CONSTRAINT fk_trabalha_dataset FOREIGN KEY (dataset_id) 
        REFERENCES feature_store.dataset(id) ON DELETE CASCADE,
    CONSTRAINT pk_trabalha_em PRIMARY KEY (conta_id, dataset_id)
);

CREATE TABLE feature_store.convite (
    destinatario_id INT NOT NULL,
    remetente_id INT NOT NULL,
    dataset_id INT NOT NULL,
    dt_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_convite_destinatario FOREIGN KEY (destinatario_id) 
        REFERENCES feature_store.conta(id) ON DELETE CASCADE,
    CONSTRAINT fk_convite_remetente FOREIGN KEY (remetente_id) 
        REFERENCES feature_store.conta(id) ON DELETE CASCADE,
    CONSTRAINT fk_convite_dataset FOREIGN KEY (dataset_id) 
        REFERENCES feature_store.dataset(id) ON DELETE CASCADE,
    CONSTRAINT pk_convite PRIMARY KEY (destinatario_id, dataset_id)
);

INSERT INTO feature_store.conta (nome, senha, email, e_admin) 
VALUES ('Waldemar', 'wald123', 'waldemar.serafim@uel.br', TRUE),
       ('Bruna', 'bru123', 'bruna.yoko@uel.br', TRUE),
       ('Carlos', 'carlos123', 'carlos.martins@email.com', FALSE),
       ('Ana', 'ana123', 'ana.silva@email.com', FALSE),
       ('João', 'joao123', 'joao.oliveira@email.com', FALSE);

INSERT INTO feature_store.dataset (nome, descricao, e_privado, criador_id)
VALUES ('Dataset de Vendas', 'Dados de vendas de uma loja online', FALSE, 1),
       ('Dataset de Clientes', 'Informações sobre os clientes da loja', TRUE, 2),
       ('Dataset de Produtos', 'Detalhes dos produtos disponíveis', FALSE, 3),
       ('Dataset de Feedback', 'Avaliações e comentários dos clientes', TRUE, 4);

INSERT INTO feature_store.dataset_versao (dataset_id, conta_id, versao_base_id, num_versao, descricao_modificacoes, arquivo_csv)
VALUES (1, 1, NULL, '1.0', 'Versão inicial do dataset de vendas', '\\x1234567890abcdef'),
       (2, 2, NULL, '1.0', 'Versão inicial do dataset de clientes', '\\xabcdef1234567890'),
       (3, 3, NULL, '1.0', 'Versão inicial do dataset de produtos', '\\xabcdefabcdef1234'),
       (4, 4, NULL, '1.0', 'Versão inicial do dataset de feedback', '\\x1234567890abcdef');

INSERT INTO feature_store.feature (versao_dataset_id, nome, descricao)
VALUES (1, 'Total de Vendas', 'Soma total das vendas por dia'),
       (1, 'Média de Vendas', 'Média diária de vendas'),
       (2, 'Número de Clientes', 'Contagem total de clientes registrados'),
       (2, 'Clientes Ativos', 'Número de clientes que fizeram compras nos últimos meses'),
       (3, 'Preço de Custo', 'Preço de custo dos produtos'),
       (3, 'Estoque Disponível', 'Quantidade de produtos em estoque'),
       (4, 'Avaliação Média', 'Média das avaliações dos clientes'),
       (4, 'Número de Comentários', 'Contagem total de comentários dos clientes');

INSERT INTO feature_store.visualizacao (conta_id, versao_dataset_id)
VALUES (1, 1),
       (2, 2),
       (3, 3),
       (4, 4),
       (5, 1);

INSERT INTO feature_store.download (conta_id, versao_dataset_id)
VALUES (1, 1),
       (2, 2),
       (3, 3),
       (4, 4),
       (5, 1);

