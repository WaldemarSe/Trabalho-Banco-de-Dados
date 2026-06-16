package com.bd.sistema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class DatasetRepository { 
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int save(Dataset dataset) {
        String sql = "INSERT INTO feature_store.dataset (nome, descricao, fontes, dt_criacao, e_privado, criador_id) " + 
                     "VALUES (?, ?, ?, NOW(), ?, ?) RETURNING id";
        return jdbcTemplate.queryForObject(sql, Integer.class, dataset.getNome(), dataset.getDescricao(), dataset.getFontes(), dataset.getEPrivado(), dataset.getCriador().getId());
    }

    public List<Dataset> buscarPorCriadorOuPublico(Usuario criador) {
        String sql = "SELECT d.*, c.nome AS nome_criador " +
                     "FROM feature_store.dataset d " +
                     "JOIN feature_store.conta c ON d.criador_id = c.id " +
                     "WHERE d.criador_id = ? OR d.e_privado = false";
        return jdbcTemplate.query(sql, new DatasetRowMapper(), criador.getId());
    }

    public Dataset buscarPorId(int id) {
        String sql = "SELECT d.*, c.nome AS nome_criador " +
                     "FROM feature_store.dataset d " +
                     "JOIN feature_store.conta c ON d.criador_id = c.id " +
                     "WHERE d.id = ?";
        return jdbcTemplate.queryForObject(sql, new DatasetRowMapper(), id);
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