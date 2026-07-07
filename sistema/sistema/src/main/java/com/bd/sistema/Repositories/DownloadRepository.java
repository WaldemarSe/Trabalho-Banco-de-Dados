package com.bd.sistema.Repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

@Repository
public class DownloadRepository { 
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public int save(int contaId, int versaoDatasetId) {
        String sql = "INSERT INTO feature_store.download (conta_id, versao_dataset_id) VALUES (?, ?)";
        return jdbcTemplate.update(sql, contaId, versaoDatasetId);
    }

    public List<Map<String, Object>> buscarTop5MaisBaixados() {
        String sql = "SELECT d.id, d.nome, COUNT(down.id) AS \"quantidade\" " +
                    "FROM feature_store.dataset d " +
                    "JOIN feature_store.dataset_versao dv ON d.id = dv.dataset_id " +
                    "JOIN feature_store.download down ON dv.id = down.versao_dataset_id " +
                    "GROUP BY d.id, d.nome " +
                    "ORDER BY \"quantidade\" DESC " +
                    "LIMIT 5";
        return jdbcTemplate.queryForList(sql);
    }
}
