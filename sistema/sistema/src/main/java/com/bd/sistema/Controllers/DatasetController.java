package com.bd.sistema.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.bd.sistema.Models.Dataset;
import com.bd.sistema.Models.DatasetVersao;
import com.bd.sistema.Models.Usuario;
import com.bd.sistema.Repositories.DatasetRepository;
import com.bd.sistema.Repositories.DatasetVersaoRepository;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Map;

import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
import java.io.IOException;

@RestController
@RequestMapping("/api/dataset")
@CrossOrigin(origins = "*")
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
    public String criarDataset(HttpSession session, Dataset dataset, DatasetVersao versaoInicial, @RequestParam("arquivo") MultipartFile arquivo) {
        
        Usuario usuarioLogado = (Usuario) session.getAttribute("usuario");

        if (usuarioLogado == null) {
            return "redirect:/home";
        }

        try {
            dataset.setCriador(usuarioLogado);
            int idNovoDataset = datasetRepository.save(dataset);
            dataset.setId(idNovoDataset);

            versaoInicial.setDataset(dataset);
            versaoInicial.setCriador(usuarioLogado);
            versaoInicial.setArquivoCsv(arquivo.getBytes());
            datasetVersaoRepository.save(versaoInicial);

            return "redirect:/home";
        } catch (IOException e) {
            e.printStackTrace();
            return "redirect:/novo-dataset?error=Erro processar arquivo CSV.";
        }
    }

    @GetMapping("/dataset/{id}")
    public String mostrarDetalhesDataset(@PathVariable("id") int id, HttpSession session, Model model) {
        
        Usuario usuarioLogado = (Usuario) session.getAttribute("usuario");

        if (usuarioLogado == null) {
            return "redirect:/home";
        }

        try {
            Dataset dataset = datasetRepository.buscarPorId(id);

            if (dataset.getCriador().getId() != usuarioLogado.getId() && dataset.getEPrivado()) {
                return "redirect:/home";
            }

            List<DatasetVersao> versoes = datasetVersaoRepository.buscarVersoesPorIdDataset(dataset.getId());

            model.addAttribute("usuario", usuarioLogado);
            model.addAttribute("dataset", dataset);
            model.addAttribute("versoes", versoes);

            return "dataset";
        } catch (EmptyResultDataAccessException e) {
            e.printStackTrace();
            return "redirect:/home?error=Dataset não encontrado.";
        }
    }

    @PostMapping("/listar-datasets-visiveis")
    public ResponseEntity<?> listarDatasetsVisiveis(@RequestBody Map<String, Object> payload) {

        if (payload == null || payload.get("id") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Usuário não autenticado."));
        }

        try {
            int idUsuario = Integer.parseInt(payload.get("id").toString());

            List<Map<String, Object>> datasetsPermitidos = datasetRepository.buscarPorCriadorOuPublico(idUsuario);

            return ResponseEntity.ok(datasetsPermitidos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao carregar dados do banco."));
        }
    }
}
