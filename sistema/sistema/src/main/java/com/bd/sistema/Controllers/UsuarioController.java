package com.bd.sistema.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.bd.sistema.Models.Usuario;
import com.bd.sistema.Repositories.UsuarioRepository;
import com.bd.sistema.dto.LoginRequestDTO;
import jakarta.servlet.http.HttpSession;
import org.springframework.ui.Model;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@RestController
@RequestMapping("/api/usuario")
@CrossOrigin(origins = "*")
public class UsuarioController {
    
    @Autowired 
    UsuarioRepository usuarioRepository;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        
        try {
            Optional<Usuario> tentativaLogin = usuarioRepository.buscarPorEmailESenha(loginRequest.email(), loginRequest.senha());

            if (tentativaLogin.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Email ou senha incorretos."));
            }

            Usuario usuarioLogado = tentativaLogin.get();
            return ResponseEntity.ok(usuarioLogado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro interno ao processar login."));
        }
    }
    

    @PostMapping("/registro")
    public ResponseEntity<?> criarConta(@RequestBody Usuario novoUsuario) {
        
        try {
            if (usuarioRepository.emailExistente(novoUsuario.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email já cadastrado."));
            }

            int idGerado = usuarioRepository.save(novoUsuario);
            novoUsuario.setId(idGerado);

            return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro interno ao criar conta."));
        }
    }
}