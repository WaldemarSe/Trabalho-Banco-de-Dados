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

import com.bd.sistema.dto.DatasetDTO;
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

    @PostMapping(value = "/criar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> criarDatasetComVersaoInicial(DatasetDTO form) {
        try {
            if (form.arquivo() == null || form.arquivo().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "O arquivo CSV inicial é obrigatório."));
            }

            Dataset novoDataset = new Dataset();
            novoDataset.setNome(form.nome());
            novoDataset.setDescricao(form.descricao());
            novoDataset.setFontes(form.fontes());
            novoDataset.setEPrivado(form.ePrivado());
            
            Usuario criador = new Usuario();
            criador.setId(form.contaId());
            novoDataset.setCriador(criador);

            // Salva o dataset e pega o ID gerado pelo banco
            int datasetIdGerado = datasetRepository.save(novoDataset); 
            novoDataset.setId(datasetIdGerado);

            // 3. Monta a Versão Inicial
            DatasetVersao versaoInicial = new DatasetVersao();
            versaoInicial.setNumVersao(form.numVersao());
            versaoInicial.setDescricaoModificacoes(form.descricaoModificacoes());
            versaoInicial.setCriador(criador);
            versaoInicial.setDataset(novoDataset);
            versaoInicial.setArquivoCsv(form.arquivo().getBytes()); 
            versaoInicial.setVersaoBase(null);

            // Salva a versão no banco
            datasetVersaoRepository.save(versaoInicial);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Dataset e versão criados com sucesso!"));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao processar os bytes do arquivo CSV."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro interno ao salvar no banco de dados."));
        }
    }
}
