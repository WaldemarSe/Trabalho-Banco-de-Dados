package com.bd.sistema.Repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

@Repository
public class ConviteRepository { 
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public boolean save(int destinatarioId, int remetenteId, int datasetId) {
        String sql = "INSERT INTO feature_store.convite (destinatario_id, remetente_id, dataset_id) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, destinatarioId, remetenteId, datasetId);
        return true;
    }

    public boolean conviteJaExiste(int destinatarioId, int datasetId) {
        String sql = "SELECT COUNT(*) FROM feature_store.convite WHERE destinatario_id = ? AND dataset_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, destinatarioId, datasetId);
        return count != null && count > 0;
    }

    public List<Map<String, Object>> buscarConvitesPendentes(int destinatarioId) {
        String sql = "SELECT c.dataset_id, d.nome AS dataset_nome, r.nome AS remetente_nome " +
                     "FROM feature_store.convite c " +
                     "JOIN feature_store.dataset d ON c.dataset_id = d.id " +
                     "JOIN feature_store.conta r ON c.remetente_id = r.id " +
                     "WHERE c.destinatario_id = ?";
        return jdbcTemplate.queryForList(sql, destinatarioId);
    }

    public void deletar(int destinatarioId, int datasetId) {
        String sql = "DELETE FROM feature_store.convite WHERE destinatario_id = ? AND dataset_id = ?";
        jdbcTemplate.update(sql, destinatarioId, datasetId);
    }
}
