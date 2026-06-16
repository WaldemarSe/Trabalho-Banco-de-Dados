package com.bd.sistema;

import java.time.LocalDateTime;

public class DatasetVersao {
    
    private int id;

    private String numVersao;

    private String descricaoModificacoes;

    private LocalDateTime dtCriacao;

    private Usuario criador;

    private Dataset dataset;

    private byte[] arquivoCsv;

    private DatasetVersao versaoBase;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNumVersao() {
        return numVersao;
    }

    public void setNumVersao(String numVersao) {
        this.numVersao = numVersao;
    }

    public String getDescricaoModificacoes() {
        return descricaoModificacoes;
    }

    public void setDescricaoModificacoes(String descricaoModificacoes) {
        this.descricaoModificacoes = descricaoModificacoes;
    }

    public LocalDateTime getDtCriacao() {
        return dtCriacao;
    }

    public void setDtCriacao(LocalDateTime dtCriacao) {
        this.dtCriacao = dtCriacao;
    }

    public Usuario getCriador() {
        return criador;
    }

    public void setCriador(Usuario criador) {
        this.criador = criador;
    }

    public Dataset getDataset() {
        return dataset;
    }

    public void setDataset(Dataset dataset) {
        this.dataset = dataset;
    }

    public byte[] getArquivoCsv() {
        return arquivoCsv;
    }

    public void setArquivoCsv(byte[] arquivoCsv) {
        this.arquivoCsv = arquivoCsv;
    }

    public DatasetVersao getVersaoBase() {
        return versaoBase;
    }

    public void setVersaoBase(DatasetVersao versaoBase) {
        this.versaoBase = versaoBase;
    }
}
