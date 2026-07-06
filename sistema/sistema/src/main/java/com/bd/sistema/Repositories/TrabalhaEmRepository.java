package com.bd.sistema.Repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class TrabalhaEmRepository { 
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void save(int contaId, int datasetId) {
        String sql = "INSERT INTO feature_store.trabalha_em (conta_id, dataset_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, contaId, datasetId);
    }
    
    public boolean eColaborador(int contaId, int datasetId) {
        String sql = "SELECT COUNT(*) FROM feature_store.trabalha_em WHERE conta_id = ? AND dataset_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, contaId, datasetId);
        return count != null && count > 0;
    }

    public List<Integer> buscarColaboradoresPorDataset(int datasetId) {
        String sql = "SELECT conta_id FROM feature_store.trabalha_em WHERE dataset_id = ?";
        return jdbcTemplate.queryForList(sql, Integer.class, datasetId);
    }
}
