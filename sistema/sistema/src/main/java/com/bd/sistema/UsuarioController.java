package com.bd.sistema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import com.bd.sistema.dto.LoginRequestDTO;

import jakarta.servlet.http.HttpSession;

import org.springframework.ui.Model;
import java.util.Optional;

@Controller
public class UsuarioController {
    
    @Autowired 
    UsuarioRepository usuarioRepository;

    @GetMapping("/login")
    public String mostrarFormLogin(Usuario usuario, Model model) {
        return "login";
    }

    @PostMapping("/login-request")
    public String login(LoginRequestDTO loginRequest, HttpSession session) {
        
        // Verifica se o email e senha correspondem a um usuário no banco de dados
        Optional<Usuario> tentativaLogin = usuarioRepository.findByEmailAndSenha(loginRequest.email(), loginRequest.senha());

        if (tentativaLogin.isEmpty()) {
            return "redirect:/login?error=true";
        }

        session.setAttribute("usuario", tentativaLogin.get());
        return "redirect:/home";
    }
}