package com.bd.sistema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpSession;
import java.util.List;

@Controller
public class HomeController {
    
    @Autowired
    DatasetRepository datasetRepository;

    @GetMapping("/home")
    public String mostrarHome(HttpSession session, Model model) {
        
        Usuario usuarioLogado = (Usuario) session.getAttribute("usuario");

        if (usuarioLogado == null) {
            return "redirect:/login";
        }

        List<Dataset> datasetsPermitidos = datasetRepository.buscarPorCriadorOuPublico(usuarioLogado);

        model.addAttribute("usuario", usuarioLogado);
        model.addAttribute("meusDatasets", datasetsPermitidos.stream()
            .filter(d -> d.getCriador().getId() == usuarioLogado.getId())
            .toList());
        model.addAttribute("datasetsPublicos", datasetsPermitidos.stream()
            .filter(d -> d.getCriador().getId() != usuarioLogado.getId())
            .toList());

        return "home";
    }
}
