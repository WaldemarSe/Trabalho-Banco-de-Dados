package com.bd.sistema;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.ui.Model;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.repository.query.Param;
import java.io.IOException;

@Controller
public class DatasetController {
    
    @Autowired
    private DatasetRepository datasetRepository;

    @Autowired
    private DatasetVersaoRepository datasetVersaoRepository;

    @GetMapping("/novo-dataset")
    public String mostrarFormCriacaoDataset(HttpSession session, Model model) {
        
        Usuario usuarioLogado = (Usuario) session.getAttribute("usuario");

        if (usuarioLogado == null) {
            return "redirect:/home";
        }

        model.addAttribute("usuario", usuarioLogado);
        model.addAttribute("dataset", new Dataset());
        model.addAttribute("versaoInicial", new DatasetVersao());

        return "novo-dataset";
    }

    @PostMapping("/criar-dataset")
    @Transactional
    public String criarDataset(HttpSession session, Dataset dataset, DatasetVersao versaoInicial, @Param("arquivo") MultipartFile arquivo) {
        
        Usuario usuarioLogado = (Usuario) session.getAttribute("usuario");

        if (usuarioLogado == null) {
            return "redirect:/home";
        }

        try {
            dataset.setCriador(usuarioLogado);
            dataset = datasetRepository.save(dataset);

            versaoInicial.setDataset(dataset);
            versaoInicial.setCriador(usuarioLogado);
            versaoInicial.setArquivoCsv(arquivo.getBytes());
            versaoInicial = datasetVersaoRepository.save(versaoInicial);

            return "redirect:/home";
        } catch (IOException e) {
            e.printStackTrace();
            return "redirect:/novo-dataset?error=Erro processar arquivo CSV.";
        }
    }
    
}
