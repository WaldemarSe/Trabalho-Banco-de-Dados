package com.bd.sistema;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.JoinColumn;

@Entity
@Table(name = "dataset_versao", schema = "feature_store")
public class DatasetVersao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "O número da versão não pode ser vazio.")
    private String numVersao;

    @Column(name = "descricao_modificacoes", nullable = true)
    private String descricaoModificacoes;

    @Column(name = "dt_criacao", updatable = false)
    @CreationTimestamp
    private LocalDateTime dtCriacao;

    @ManyToOne
    @JoinColumn(name = "conta_id", nullable = false)
    private Usuario criador;

    @ManyToOne
    @JoinColumn(name = "dataset_id", nullable = false)
    private Dataset dataset;

    @Column(name = "arquivo_csv", nullable = false)
    private byte[] arquivoCsv;

    @ManyToOne
    @JoinColumn(name = "versao_base_id", nullable = true)
    private DatasetVersao versaoBase;

    public int getId() {
        return id;
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
}
