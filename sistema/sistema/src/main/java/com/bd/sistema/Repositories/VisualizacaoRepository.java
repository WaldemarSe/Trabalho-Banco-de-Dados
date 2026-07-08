package com.bd.sistema.Repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

@Repository
public class VisualizacaoRepository { 
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public int save(int contaId, int versaoDatasetId) {
        String sql = "INSERT INTO feature_store.visualizacao (conta_id, versao_dataset_id) VALUES (?, ?)";
        return jdbcTemplate.update(sql, contaId, versaoDatasetId);
    }

    // Monta o gráfico de visualizações e downloads
    public List<Map<String, Object>> buscarDadosGrafico(int datasetId) {
        String sql = "SELECT " +
                     "  TO_CHAR(t.dt_e_hora, 'DD/MM/YYYY') AS \"dataEixo\", " +
                     "  SUM(CASE WHEN t.origem = 'V' THEN 1 ELSE 0 END) AS \"visualizacoes\", " +
                     "  SUM(CASE WHEN t.origem = 'D' THEN 1 ELSE 0 END) AS \"downloads\" " +
                     "FROM ( " +
                     "  SELECT v.dt_e_hora, 'V' AS origem, v.versao_dataset_id " +
                     "  FROM feature_store.visualizacao v " +
                     "  UNION ALL " +
                     "  SELECT d.dt_e_hora, 'D' AS origem, d.versao_dataset_id " +
                     "  FROM feature_store.download d " +
                     ") t " +
                     "JOIN feature_store.dataset_versao dv ON t.versao_dataset_id = dv.id " +
                     "WHERE dv.dataset_id = ? " +
                     "  AND t.dt_e_hora >= '2026-06-08 00:00:00'::timestamp " + 
                     "GROUP BY TO_CHAR(t.dt_e_hora, 'DD/MM/YYYY'), t.dt_e_hora::date " +
                     "ORDER BY t.dt_e_hora::date ASC";

        return jdbcTemplate.queryForList(sql, datasetId);
    }

    // Monta a tabela de visualizações e downloads
    public List<Map<String, Object>> buscarDadosTabela(int datasetId) {
        String sql = "SELECT " +
                     "   c.nome AS \"nome\", " +
                     "   c.email AS \"email\", " +
                     "   TO_CHAR(v.dt_e_hora, 'DD/MM/YYYY') AS \"dataAcesso\", " +
                     "   CASE WHEN EXISTS ( " +
                     "       SELECT 1 " +
                     "       FROM feature_store.download d " +
                     "       JOIN feature_store.dataset_versao dv2 ON d.versao_dataset_id = dv2.id " +
                     "       WHERE dv2.dataset_id = dv.dataset_id " +
                     "           AND d.conta_id = v.conta_id " +
                     "           AND d.dt_e_hora::date = v.dt_e_hora::date " +
                     "   ) THEN 'Sim' ELSE 'Não' END AS \"baixouArquivo\" " +
                     "FROM feature_store.visualizacao v " +
                     "JOIN feature_store.conta c ON v.conta_id = c.id " +
                     "JOIN feature_store.dataset_versao dv ON v.versao_dataset_id = dv.id " +
                     "WHERE dv.dataset_id = ? " +
                     "  AND v.dt_e_hora >= '2026-06-08 00:00:00'::timestamp " +
                     "ORDER BY v.dt_e_hora DESC"; 

        return jdbcTemplate.queryForList(sql, datasetId);
    }

    public List<Map<String, Object>> buscarTop5MaisVistos() {
        String sql = "SELECT d.id, d.nome, COUNT(v.id) AS \"quantidade\" " +
                     "FROM feature_store.dataset d " +
                     "JOIN feature_store.dataset_versao dv ON d.id = dv.dataset_id " +
                     "JOIN feature_store.visualizacao v ON dv.id = v.versao_dataset_id " +
                     "GROUP BY d.id, d.nome " +
                     "ORDER BY \"quantidade\" DESC " +
                     "LIMIT 5";
        return jdbcTemplate.queryForList(sql);
    }
}