package com.bd.sistema.Repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.bd.sistema.Models.Usuario;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

@Repository
public class UsuarioRepository { 
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public int save(Usuario usuario) {
        String sql = "INSERT INTO feature_store.conta (nome, senha, email, e_admin) " + 
                     "VALUES (?, ?, ?, ?) RETURNING id";
        return jdbcTemplate.queryForObject(sql, Integer.class, usuario.getNome(), usuario.getSenha(), usuario.getEmail(), false);
    }

    public Optional<Usuario> buscarPorEmailESenha(String email, String senha){
        String sql = "SELECT * FROM feature_store.conta WHERE email = ? AND senha = ?";
        try {
            Usuario usuario = jdbcTemplate.queryForObject(sql, new UsuarioRowMapper(), email, senha);
            return Optional.of(usuario);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public boolean emailExistente(String email) {
        String sql = "SELECT COUNT(*) FROM feature_store.conta WHERE email = ?";
        Integer total = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return total != null && total > 0;
    }

    private static class UsuarioRowMapper implements RowMapper<Usuario> {
        @Override
        public Usuario mapRow(ResultSet rs, int rowNum) throws SQLException {
            Usuario usuario = new Usuario();
            usuario.setId(rs.getInt("id"));
            usuario.setNome(rs.getString("nome"));
            usuario.setEmail(rs.getString("email"));
            usuario.setSenha(rs.getString("senha"));

            return usuario;
        }
    }
}