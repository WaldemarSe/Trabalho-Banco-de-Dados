package com.bd.sistema;

import java.time.LocalDateTime;
import java.util.List;

public class Dataset {

    private int id;

    private String nome;

    private String descricao;

    private String fontes;

    private LocalDateTime dtCriacao;

    private Boolean ePrivado;

    private Usuario criador;

    private List<DatasetVersao> versoes;

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

    public String getFontes() {
        return fontes;
    }

    public void setFontes(String fontes) {
        this.fontes = fontes;
    }

    public LocalDateTime getDtCriacao() {
        return dtCriacao;
    }

    public void setDtCriacao(LocalDateTime dtCriacao) {
        this.dtCriacao = dtCriacao;
    }

    public Boolean getEPrivado() {
        return ePrivado;
    }

    public void setEPrivado(Boolean ePrivado) {
        this.ePrivado = ePrivado;
    }

    public Usuario getCriador() {
        return criador;
    }

    public void setCriador(Usuario criador) {
        this.criador = criador;
    }

    public List<DatasetVersao> getVersoes() {
        return versoes;
    }

    public void addVersao(DatasetVersao versao) {
        this.versoes.add(versao);
    }
}
