package com.bd.sistema;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.JoinColumn;
import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;

@Entity
public class Dataset {

    @Id
    private int id;

    @NotBlank(message = "O nome do dataset não pode ser vazio.")
    private String nome;

    @Column(name = "descricao_modificacoes", nullable = true)
    private String descricao;

    @Column(name = "dt_criacao", updatable = false)
    @CreationTimestamp
    private LocalDateTime dtCriacao;

    @Column(name = "e_privado")
    private Boolean ePrivado;

    @ManyToOne
    @JoinColumn(name = "criador_id", nullable = false)
    private Usuario criador;

    @OneToMany(mappedBy = "dataset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DatasetVersao> versoes;

    public int getId() {
        return id;
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

    public LocalDateTime getDtCriacao() {
        return dtCriacao;
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

    public List<DatasetVersao> getVersoes() {
        return versoes;
    }

    public void addVersao(DatasetVersao versao) {
        this.versoes.add(versao);
    }
}
