package com.bd.sistema.Repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.bd.sistema.Models.Dataset;
import com.bd.sistema.Models.DatasetVersao;

import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class DatasetVersaoRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public int save(DatasetVersao versao) {
        String sql = "INSERT INTO feature_store.dataset_versao (num_versao, descricao_modificacoes, dt_criacao, conta_id, dataset_id, arquivo_csv, versao_base_id) " +
                     "VALUES (?, ?, NOW(), ?, ?, ?, ?) RETURNING id";
        return jdbcTemplate.queryForObject(sql, Integer.class, versao.getNumVersao(), versao.getDescricaoModificacoes(), versao.getCriador().getId(), versao.getDataset().getId(), 
                                            versao.getArquivoCsv(), versao.getVersaoBase() != null ? versao.getVersaoBase().getId() : null);
    }

    public List<DatasetVersao> buscarVersoesPorIdDataset(int idDataset) {
        String sql = "SELECT * FROM feature_store.dataset_versao " + 
                     "WHERE dataset_id = ? ORDER BY dt_criacao DESC";
        
        return jdbcTemplate.query(sql, new DatasetVersaoRowMapper(), idDataset);
    }

    public DatasetVersao buscarArquivoPorId(int idVersao) {
        String sql = "SELECT v.arquivo_csv, v.num_versao, d.nome AS nome_dataset " +
                     "FROM feature_store.dataset_versao v " +
                     "JOIN feature_store.dataset d ON v.dataset_id = d.id " + 
                     "WHERE v.id = ?";
        
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            DatasetVersao v = new DatasetVersao();
            v.setArquivoCsv(rs.getBytes("arquivo_csv"));
            v.setNumVersao(rs.getString("num_versao"));
            
            Dataset d = new Dataset();
            d.setNome(rs.getString("nome_dataset"));
            v.setDataset(d);
            
            return v;
        }, idVersao);
    }

    private static class DatasetVersaoRowMapper implements RowMapper<DatasetVersao> {
        @Override
        public DatasetVersao mapRow(ResultSet rs, int rowNum) throws SQLException {
            DatasetVersao versao = new DatasetVersao();
            versao.setId(rs.getInt("id"));
            versao.setNumVersao(rs.getString("num_versao"));
            versao.setDescricaoModificacoes(rs.getString("descricao_modificacoes"));
            if (rs.getTimestamp("dt_criacao") != null) {
                versao.setDtCriacao(rs.getTimestamp("dt_criacao").toLocalDateTime());
            }
            versao.setArquivoCsv(rs.getBytes("arquivo_csv"));

            return versao;
        }
    }
}