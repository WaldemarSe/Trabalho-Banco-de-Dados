package com.bd.sistema.Repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.bd.sistema.Models.DatasetVersao;
import com.bd.sistema.Models.Feature;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import java.util.List;

@Repository
public class FeatureRepository { 
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public int save(Feature feature) {
        String sql = "INSERT INTO feature_store.feature (versao_dataset_id, nome, descricao) " + 
                     "VALUES (?, ?, ?) RETURNING id";
        return jdbcTemplate.queryForObject(sql, Integer.class, feature.getVersaoDataset().getId(), feature.getNome(), feature.getDescricao());
    }

    public List<Feature> buscarFeaturesPorIdVersao(int idVersao) {
        String sql = "SELECT * FROM feature_store.feature " + 
                     "WHERE versao_dataset_id = ?";
        
        return jdbcTemplate.query(sql, new FeatureRowMapper(), idVersao);
    }

    private static class FeatureRowMapper implements RowMapper<Feature> {
        @Override
        public Feature mapRow(ResultSet rs, int rowNum) throws SQLException {
            Feature feature = new Feature();
            feature.setId(rs.getInt("id"));
            feature.setNome(rs.getString("nome"));
            feature.setDescricao(rs.getString("descricao"));
            return feature;
        }
    }
}
