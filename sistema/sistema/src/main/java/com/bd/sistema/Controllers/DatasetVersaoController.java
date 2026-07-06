package com.bd.sistema.Controllers;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.bd.sistema.Models.Dataset;
import com.bd.sistema.Models.DatasetVersao;
import com.bd.sistema.Models.Usuario;
import com.bd.sistema.Repositories.DatasetRepository;
import com.bd.sistema.Repositories.DatasetVersaoRepository;

import org.springframework.ui.Model;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/dataset")
@CrossOrigin(origins = "*")
public class DatasetVersaoController {
    
    @Autowired
    DatasetVersaoRepository datasetVersaoRepository;

    @Autowired
    DatasetRepository datasetRepository;

    @PostMapping("/dataset/{idDataset}/criar-versao")
    public String criarVersao(@PathVariable("idDataset") int idDataset, @RequestParam("arquivo") MultipartFile arquivo, 
                                        @RequestParam(value = "baseId", required = false)Integer baseId, HttpSession session, DatasetVersao novaVersao) {

        Usuario usuarioLogado = (Usuario) session.getAttribute("usuario");

        if (usuarioLogado == null) {
            return "redirect:/home";
        }

        try {
            Dataset dataset = datasetRepository.buscarPorId(idDataset);
            novaVersao.setDataset(dataset);
            novaVersao.setCriador(usuarioLogado);
            novaVersao.setArquivoCsv(arquivo.getBytes());

            if (baseId != null) {
                DatasetVersao versaoBase = new DatasetVersao();
                versaoBase.setId(baseId);
                novaVersao.setVersaoBase(versaoBase);
            }

            datasetVersaoRepository.save(novaVersao);

            return "redirect:/dataset/" + idDataset;
        } catch (IOException e) {
            e.printStackTrace();
            return "redirect:/dataset/" + idDataset + "/nova-versao?error=Erro ao processar arquivo CSV.";
        }
    }

    @GetMapping("/dataset/versao/{id}/download")
    public ResponseEntity<byte[]> baixarCsv(@PathVariable("id") int id, HttpSession session) {
        
        Usuario usuarioLogado = (Usuario) session.getAttribute("usuario");
        if (usuarioLogado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            DatasetVersao versao = datasetVersaoRepository.buscarArquivoPorId(id);
            
            if (versao == null || versao.getArquivoCsv() == null) {
                return ResponseEntity.notFound().build();
            }

            String nomeArquivo = versao.getDataset().getNome() + "_" + versao.getNumVersao() + ".csv";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", nomeArquivo);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(versao.getArquivoCsv(), headers, HttpStatus.OK);

        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
