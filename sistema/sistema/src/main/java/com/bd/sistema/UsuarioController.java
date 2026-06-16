package com.bd.sistema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

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
        
        Optional<Usuario> tentativaLogin = usuarioRepository.buscarPorEmailESenha(loginRequest.email(), loginRequest.senha());

        if (tentativaLogin.isEmpty()) {
            return "redirect:/login?error=true";
        }

        session.setAttribute("usuario", tentativaLogin.get());
        return "redirect:/home";
    }

    @GetMapping("/registro")
    public String mostrarFormRegistro(Model model) {
        model.addAttribute("novoUsuario", new Usuario());

        return "registro";
    }

    @PostMapping("/registro-request")
    public String criarConta(Usuario novoUsuario, HttpSession session, RedirectAttributes redirectAttributes) {
        
        try {
            if (usuarioRepository.emailExistente(novoUsuario.getEmail())) {
                redirectAttributes.addFlashAttribute("error", "Email já cadastrado.");
                return "redirect:/registro";
            }

            int idGerado = usuarioRepository.save(novoUsuario);
            novoUsuario.setId(idGerado);

            session.setAttribute("usuario", novoUsuario);
            return "redirect:/home";
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Erro ao criar conta.");
            return "redirect:/registro";
        }
    }
}