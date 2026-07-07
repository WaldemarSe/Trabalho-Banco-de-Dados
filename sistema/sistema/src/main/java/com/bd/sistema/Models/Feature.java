package com.bd.sistema.Models;

public class Feature {
    
    private int id;

    private String nome;

    private String descricao;

    private String tipo;

    private DatasetVersao versaoDataset;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public DatasetVersao getVersaoDataset() {
        return versaoDataset;
    }

    public void setVersaoDataset(DatasetVersao versaoDataset) {
        this.versaoDataset = versaoDataset;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}
