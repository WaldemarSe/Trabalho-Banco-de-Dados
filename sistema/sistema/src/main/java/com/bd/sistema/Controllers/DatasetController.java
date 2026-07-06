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
import com.bd.sistema.Models.Feature;
import com.bd.sistema.Repositories.DatasetRepository;
import com.bd.sistema.Repositories.FeatureRepository;
import com.bd.sistema.Repositories.DatasetVersaoRepository;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Map;
import com.bd.sistema.dto.IdUsuarioDTO;

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

    @Autowired
    private FeatureRepository featureRepository;

    @GetMapping("/detalhes/{id}")
    public ResponseEntity<?> mostrarDetalhesDataset(@PathVariable("id") int id) {
        try {
            Dataset dataset = datasetRepository.buscarPorId(id);

            List<DatasetVersao> versoes = datasetVersaoRepository.buscarVersoesPorIdDataset(dataset.getId());

            for (DatasetVersao versao : versoes) {
                List<Feature> features = featureRepository.buscarFeaturesPorIdVersao(versao.getId());
                versao.setFeatures(features);
            }

            Map<String, Object> response = Map.of(
                "dataset", dataset,
                "versoes", versoes
            );

            return ResponseEntity.ok(response);

        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Dataset não encontrado."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao carregar dados do banco."));
        }
    }

    @PostMapping("/listar-datasets-visiveis")
    public ResponseEntity<?> listarDatasetsVisiveis(@RequestBody IdUsuarioDTO idRequest) {

        if (idRequest == null || idRequest.id() == 0) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Usuário não autenticado."));
        }

        try {
            int idUsuario = idRequest.id();

            List<Map<String, Object>> datasetsPermitidos = datasetRepository.buscarPorCriadorOuPublico(idUsuario);

            return ResponseEntity.ok(datasetsPermitidos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao carregar dados do banco."));
        }
    }

    @GetMapping("/versao/{idVersao}/download")
    public ResponseEntity<byte[]> baixarArquivoCsv(@PathVariable("idVersao") int idVersao) {
        try {
            // Busca a versão com o array de bytes e o nome do dataset vinculados
            DatasetVersao versao = datasetVersaoRepository.buscarArquivoPorId(idVersao);
            
            if (versao == null || versao.getArquivoCsv() == null) {
                return ResponseEntity.notFound().build();
            }

            // Sanitiza o nome do arquivo (ex: "Dataset_de_Clientes_v1.0.csv")
            String nomeArquivo = versao.getDataset().getNome().replaceAll("[^a-zA-Z0-9.-]", "_") 
                                 + "_" + versao.getNumVersao() + ".csv";

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + nomeArquivo + "\"")
                    .header("Content-Type", "text/csv; charset=utf-8")
                    .body(versao.getArquivoCsv());
                    
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
