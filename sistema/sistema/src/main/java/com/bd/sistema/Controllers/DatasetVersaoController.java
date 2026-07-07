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
import com.bd.sistema.Models.Feature;
import com.bd.sistema.Repositories.DatasetRepository;
import com.bd.sistema.Repositories.DatasetVersaoRepository;
import com.bd.sistema.Repositories.VisualizacaoRepository;
import com.bd.sistema.Repositories.DownloadRepository;
import com.bd.sistema.Repositories.FeatureRepository;

import org.springframework.ui.Model;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.bd.sistema.dto.VersaoDTO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dataset/versao")
@CrossOrigin(origins = "*")
public class DatasetVersaoController {
    
    @Autowired
    DatasetVersaoRepository datasetVersaoRepository;

    @Autowired
    DatasetRepository datasetRepository;

    @Autowired
    DownloadRepository downloadRepository;

    @Autowired
    VisualizacaoRepository visualizacaoRepository;

    @Autowired
    FeatureRepository featureRepository;

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> baixarCsv(@PathVariable("id") int id, @RequestParam("contaId") int contaId) { 

        try {
            DatasetVersao versao = datasetVersaoRepository.buscarArquivoPorId(id);
            
            if (versao == null || versao.getArquivoCsv() == null) {
                return ResponseEntity.notFound().build();
            }

            String nomeArquivo = versao.getDataset().getNome().replaceAll("[^a-zA-Z0-9.-]", "_") + "_" + versao.getNumVersao() + ".csv";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", nomeArquivo);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            downloadRepository.save(contaId, id); 

            return new ResponseEntity<>(versao.getArquivoCsv(), headers, HttpStatus.OK);

        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(value = "/nova", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> criarNovaVersao(VersaoDTO form) {
        try {
            // validações
            if (form.arquivo() == null || form.arquivo().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "O arquivo CSV é obrigatório."));
            }
            if (form.numVersao() == null || form.numVersao().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "O identificador da versão é obrigatório."));
            }

            // preenche o modelo DatasetVersao
            DatasetVersao novaVersao = new DatasetVersao();
            novaVersao.setNumVersao(form.numVersao());
            novaVersao.setDescricaoModificacoes(form.descricaoModificacoes());
            
            // Converte o arquivo em bytes
            novaVersao.setArquivoCsv(form.arquivo().getBytes());

            // Vincula os relacionamentos
            Dataset datasetPai = new Dataset();
            datasetPai.setId(form.datasetId());
            novaVersao.setDataset(datasetPai);

            Usuario autor = new Usuario();
            autor.setId(form.contaId());
            novaVersao.setCriador(autor);

            if (form.versaoBaseId() != null && form.versaoBaseId() > 0) {
                DatasetVersao versaoBase = new DatasetVersao();
                versaoBase.setId(form.versaoBaseId());
                novaVersao.setVersaoBase(versaoBase);
            } else {
                novaVersao.setVersaoBase(null);
            }

            int versaoId = datasetVersaoRepository.save(novaVersao);
            novaVersao.setId(versaoId);

            if (form.featureNome() != null && !form.featureNome().isEmpty()) {
                for (int i = 0; i < form.featureNome().size(); i++) {
                    String nomeFeat = form.featureNome().get(i);
                    
                    // Validação simples para ignorar linhas enviadas em branco
                    if (nomeFeat == null || nomeFeat.isBlank()) {
                        continue;
                    }

                    // Instancia o seu modelo Feature.java
                    Feature novaFeature = new Feature();
                    novaFeature.setNome(nomeFeat);
                    novaFeature.setTipo(form.featureTipo().get(i));
                    novaFeature.setDescricao(form.featureDescricao().get(i));
                    novaFeature.setVersaoDataset(novaVersao); // Vincula à versão base

                    // Salva usando o seu FeatureRepository.java original
                    featureRepository.save(novaFeature);
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Nova versão registrada com sucesso!"));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro ao processar os bytes do arquivo CSV enviado."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro interno ao persistir a versão no banco de dados."));
        }
    }

    @PostMapping("/{versaoId}/visualizar")
    public ResponseEntity<?> registrarVisualizacao(@PathVariable int versaoId, @RequestParam int contaId) {
        try {
            // registra a visualização
            visualizacaoRepository.save(contaId, versaoId);
            return ResponseEntity.ok(Map.of("message", "Visualização registrada com sucesso!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro ao registrar a visualização."));
        }
    }

    @GetMapping("/{versaoId}/features")
    public ResponseEntity<?> obterFeaturesDaVersaoBase(@PathVariable Long versaoId) {
        try {
            // Busca as features associadas a versão base
            List<Map<String, Object>> features = featureRepository.buscarFeaturesPorVersaoId(versaoId);
            
            return ResponseEntity.ok(features);
        } catch (Exception e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("message", "Erro ao buscar as features da versão base.");
            return ResponseEntity.status(500).body(erro);
        }
    }

    @DeleteMapping("/{id}/deletar")
    public ResponseEntity<?> deletarVersao(@PathVariable Long id) {
        try {
            int linhasAfetadas = datasetVersaoRepository.deletarPorId(id);
            
            if (linhasAfetadas == 0) {
                Map<String, String> resposta = new HashMap<>();
                resposta.put("message", "Versão não encontrada.");
                return ResponseEntity.status(404).body(resposta);
            }

            Map<String, String> resposta = new HashMap<>();
            resposta.put("message", "Versão deletada com sucesso.");
            return ResponseEntity.ok(resposta);
            
        } catch (Exception e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("message", "Erro ao deletar a versão do dataset.");
            return ResponseEntity.status(500).body(erro);
        }
    }
}
