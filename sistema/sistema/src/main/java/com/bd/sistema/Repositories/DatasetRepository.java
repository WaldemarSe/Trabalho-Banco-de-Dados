package com.bd.sistema.Repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.bd.sistema.Models.Dataset;
import com.bd.sistema.Models.Usuario;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@Repository
public class DatasetRepository { 
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int save(Dataset dataset) {
        String sql = "INSERT INTO feature_store.dataset (nome, descricao, fontes, dt_criacao, e_privado, criador_id) " + 
                     "VALUES (?, ?, ?, NOW(), ?, ?) RETURNING id";
        return jdbcTemplate.queryForObject(sql, Integer.class, dataset.getNome(), dataset.getDescricao(), dataset.getFontes(), dataset.getEPrivado(), dataset.getCriador().getId());
    }

    public List<Map<String, Object>> buscarPorColaborador(int usuarioId) {
        String sql = "SELECT d.id, d.nome, d.e_privado, d.dt_criacao, d.criador_id, d.descricao, c.nome AS nome_criador " +
                     "FROM feature_store.dataset d " +
                     "JOIN feature_store.conta c ON d.criador_id = c.id " +
                     "WHERE d.criador_id = ? " +
                     "UNION " +
                     "SELECT d.id, d.nome, d.e_privado, d.dt_criacao, d.criador_id, d.descricao, c.nome AS nome_criador " +
                     "FROM feature_store.dataset d " +
                     "JOIN feature_store.conta c ON d.criador_id = c.id " +
                     "JOIN feature_store.trabalha_em t ON d.id = t.dataset_id " +
                     "WHERE t.conta_id = ?";
                     
        return jdbcTemplate.queryForList(sql, usuarioId, usuarioId);
    }

    public List<Map<String, Object>> buscarDatasetsPublicos(int usuarioId) {
        String sql = "SELECT d.id, d.nome, d.e_privado, d.dt_criacao, d.criador_id, d.descricao, c.nome AS nome_criador " +
                     "FROM feature_store.dataset d " +
                     "JOIN feature_store.conta c ON d.criador_id = c.id " +
                     "WHERE d.e_privado = false " +
                     "AND d.criador_id <> ? " + // ignora os datasets criados pelo usuário
                     "AND d.id NOT IN ( " +
                     "  SELECT dataset_id FROM feature_store.trabalha_em WHERE conta_id = ? )"; // ignora os que ele trabalha
                     
        return jdbcTemplate.queryForList(sql, usuarioId, usuarioId);
    }

    public Dataset buscarPorId(int id) {
        String sql = "SELECT d.*, c.nome AS nome_criador " +
                     "FROM feature_store.dataset d " +
                     "JOIN feature_store.conta c ON d.criador_id = c.id " +
                     "WHERE d.id = ?";
        return jdbcTemplate.queryForObject(sql, new DatasetRowMapper(), id);
    }

    public int contarTotalDatasets() {
        String sql = "SELECT COUNT(*) FROM feature_store.dataset";
        return jdbcTemplate.queryForObject(sql, Integer.class);
    }

    private static class DatasetRowMapper implements RowMapper<Dataset> {
        @Override
        public Dataset mapRow(ResultSet rs, int rowNum) throws SQLException {
            Dataset dataset = new Dataset();
            dataset.setId(rs.getInt("id"));
            dataset.setNome(rs.getString("nome"));
            dataset.setDescricao(rs.getString("descricao"));
            dataset.setFontes(rs.getString("fontes"));
            dataset.setEPrivado(rs.getBoolean("e_privado"));
            if (rs.getTimestamp("dt_criacao") != null) {
                dataset.setDtCriacao(rs.getTimestamp("dt_criacao").toLocalDateTime());
            }

            Usuario criador = new Usuario();
            criador.setId(rs.getInt("criador_id"));
            criador.setNome(rs.getString("nome_criador"));
            dataset.setCriador(criador);

            return dataset;
        }
    }
}