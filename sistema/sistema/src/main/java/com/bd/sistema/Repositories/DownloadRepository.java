package com.bd.sistema.Repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DownloadRepository { 
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public int save(int contaId, int versaoDatasetId) {
        String sql = "INSERT INTO feature_store.download (conta_id, versao_dataset_id) VALUES (?, ?)";
        return jdbcTemplate.update(sql, contaId, versaoDatasetId);
    }
}
