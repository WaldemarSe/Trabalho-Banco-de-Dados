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

    // Monta o agregador do Gráfico de Linhas (A partir de 08/06/2026)
    public List<Map<String, Object>> buscarDadosGrafico(int datasetId) {
        String sql = "SELECT " +
                     "   TO_CHAR(t.dt_e_hora, 'DD/MM/YYYY') AS \"dataEixo\", " +
                     "   SUM(CASE WHEN t.origem = 'V' THEN 1 ELSE 0 END) AS \"visualizacoes\", " +
                     "   SUM(CASE WHEN t.origem = 'D' THEN 1 ELSE 0 END) AS \"downloads\" " +
                     "FROM ( " +
                     "   SELECT v.dt_e_hora, 'V' AS origem, v.versao_dataset_id " +
                     "   FROM feature_store.visualizacao v " +
                     "   UNION ALL " +
                     "   SELECT d.dt_e_hora, 'D' AS origem, d.versao_dataset_id " +
                     "   FROM feature_store.download d " +
                     ") t " +
                     "JOIN feature_store.dataset_versao dv ON t.versao_dataset_id = dv.id " +
                     "WHERE dv.dataset_id = ? " +
                     "  AND t.dt_e_hora >= '2026-06-08 00:00:00'::timestamp " + 
                     "GROUP BY TO_CHAR(t.dt_e_hora, 'DD/MM/YYYY'), t.dt_e_hora::date " +
                     "ORDER BY t.dt_e_hora::date ASC";

        return jdbcTemplate.queryForList(sql, datasetId);
    }

    // Monta a Tabela de Auditoria de Usuários (Quem visualizou e se baixou no mesmo dia)
    // Monta a Tabela de Auditoria de Usuários (Quem visualizou e se baixou no mesmo dia)
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
                     "ORDER BY v.dt_e_hora DESC"; // 👈 Removeu o GROUP BY problemático e simplificou o ORDER BY

        return jdbcTemplate.queryForList(sql, datasetId);
    }
}