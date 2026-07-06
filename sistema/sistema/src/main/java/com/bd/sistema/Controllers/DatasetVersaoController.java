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
import com.bd.sistema.Repositories.VisualizacaoRepository;
import com.bd.sistema.Repositories.DownloadRepository;

import org.springframework.ui.Model;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import com.bd.sistema.dto.VersaoDTO;
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

            datasetVersaoRepository.save(novaVersao);

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
}
