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
import com.bd.sistema.Repositories.TrabalhaEmRepository;
import com.bd.sistema.Repositories.ConviteRepository;
import com.bd.sistema.Repositories.UsuarioRepository;
import com.bd.sistema.Repositories.VisualizacaoRepository;
import com.bd.sistema.Repositories.DownloadRepository;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import java.util.Map;
import com.bd.sistema.dto.IdUsuarioDTO;
import com.bd.sistema.dto.FeatureDTO;

import org.springframework.web.bind.annotation.PathVariable;

import java.util.HashMap;
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

    @Autowired
    private TrabalhaEmRepository trabalhaEmRepository;

    @Autowired
    private ConviteRepository conviteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private VisualizacaoRepository visualizacaoRepository;
    
    @Autowired
    private DownloadRepository downloadRepository;

    @GetMapping("/detalhes/{id}")
    public ResponseEntity<?> mostrarDetalhesDataset(@PathVariable("id") int id) {
        try {
            Dataset dataset = datasetRepository.buscarPorId(id);

            List<DatasetVersao> versoes = datasetVersaoRepository.buscarVersoesPorIdDataset(dataset.getId());

            for (DatasetVersao versao : versoes) {
                List<Feature> features = featureRepository.buscarFeaturesPorIdVersao(versao.getId());
                versao.setFeatures(features);
            }

            List<Integer> colaboradoresIds = trabalhaEmRepository.buscarColaboradoresPorDataset(dataset.getId());

            Map<String, Object> response = Map.of(
                "dataset", dataset,
                "versoes", versoes,
                "colaboradores", colaboradoresIds
            );

            return ResponseEntity.ok(response);

        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Dataset não encontrado."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao carregar dados do banco."));
        }
    }

    @GetMapping("/barra-lateral")
    public ResponseEntity<?> listarBarraLateral(@RequestParam("usuarioId") int usuarioId) {
        try {
            List<Map<String, Object>> datasets = datasetRepository.buscarPorColaborador(usuarioId);
            return ResponseEntity.ok(datasets);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao carregar barra lateral."));
        }
    }

    @GetMapping("/feed")
    public ResponseEntity<?> listarFeed(@RequestParam("usuarioId") int usuarioId) {
        try {
            List<Map<String, Object>> datasets = datasetRepository.buscarDatasetsPublicos(usuarioId);
            return ResponseEntity.ok(datasets);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao carregar feed."));
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

            DatasetVersao versaoInicial = new DatasetVersao();
            versaoInicial.setNumVersao(form.numVersao());
            versaoInicial.setDescricaoModificacoes(form.descricaoModificacoes());
            versaoInicial.setCriador(criador);
            versaoInicial.setDataset(novoDataset);
            versaoInicial.setArquivoCsv(form.arquivo().getBytes()); 
            versaoInicial.setVersaoBase(null);

            // Salva a versão no banco
            int idVersaoCriada = datasetVersaoRepository.save(versaoInicial);
            versaoInicial.setId(idVersaoCriada);

            if (form.featureNome() != null && !form.featureNome().isEmpty()) {
                for (int i = 0; i < form.featureNome().size(); i++) {
                    String nomeFeat = form.featureNome().get(i);
                    
                    if (nomeFeat == null || nomeFeat.isBlank()) {
                        continue;
                    }

                    Feature novaFeature = new Feature();
                    novaFeature.setNome(nomeFeat);
                    novaFeature.setTipo(form.featureTipo().get(i));
                    novaFeature.setDescricao(form.featureDescricao().get(i));
                    novaFeature.setVersaoDataset(versaoInicial); // Vincula à versão base

                    featureRepository.save(novaFeature);
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Dataset e versão criados com sucesso!"));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao processar os bytes do arquivo CSV."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro interno ao salvar no banco de dados."));
        }
    }

    @PostMapping("/{id}/convidar")
    public ResponseEntity<?> convidarParticipante(@PathVariable("id") int datasetId, @RequestParam("remetenteId") int remetenteId,
                                                  @RequestParam("emailDestinatario") String emailDestinatario) {
        try {
            Dataset dataset = datasetRepository.buscarPorId(datasetId);
            
            boolean ehCriador = (dataset.getCriador().getId() == remetenteId);
            boolean ehColaborador = trabalhaEmRepository.eColaborador(remetenteId, datasetId);
            
            if (!ehCriador && !ehColaborador) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Você não tem permissão para convidar membros para este dataset."));
            }

            // Busca o ID do destinatário pelo e-mail
            Integer destinatarioId;

            try {
                destinatarioId = usuarioRepository.buscarIdPorEmail(emailDestinatario);
            } catch (EmptyResultDataAccessException e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Nenhum usuário encontrado com este e-mail."));
            }

            if (destinatarioId == remetenteId) {
                return ResponseEntity.badRequest().body(Map.of("message", "Você não pode convidar a si mesmo."));
            }

            if (dataset.getCriador().getId() == destinatarioId) {
                return ResponseEntity.badRequest().body(Map.of("message", "Este usuário já é o proprietário do dataset."));
            }

            if (trabalhaEmRepository.eColaborador(destinatarioId, datasetId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Este usuário já trabalha neste dataset."));
            }

            if (conviteRepository.conviteJaExiste(destinatarioId, datasetId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Já existe um convite pendente para este usuário neste dataset."));
            }

            conviteRepository.save(destinatarioId, remetenteId, datasetId);
            return ResponseEntity.ok(Map.of("message", "Convite enviado com sucesso!"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao processar o convite."));
        }
    }

    @GetMapping("/convites")
    public ResponseEntity<?> listarConvitesPessoais(@RequestParam("contaId") int contaId) {
        try {
            List<Map<String, Object>> convites = conviteRepository.buscarConvitesPendentes(contaId);
            return ResponseEntity.ok(convites);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao buscar convites."));
        }
    }

    @PostMapping("/convites/responder")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> responderConvite(@RequestParam("contaId") int contaId, @RequestParam("datasetId") int datasetId, @RequestParam("aceitou") boolean aceitou) {

        try {
            // se aceitou, adiciona como colaborador
            if (aceitou) {
                trabalhaEmRepository.save(contaId, datasetId);
            }
            
            // deleta o convite, independente da resposta
            conviteRepository.deletar(contaId, datasetId);
            
            String mensagem = aceitou ? "Convite aceito." : "Convite recusado.";
            return ResponseEntity.ok(Map.of("message", mensagem));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao processar resposta do convite."));
        }
    }

    @GetMapping("/{id}/relatorio")
    public ResponseEntity<?> obterRelatorioDataset(@PathVariable("id") int datasetId) {
        try {
            List<Map<String, Object>> dadosGrafico = visualizacaoRepository.buscarDadosGrafico(datasetId);
            List<Map<String, Object>> dadosTabela = visualizacaoRepository.buscarDadosTabela(datasetId);

            Map<String, Object> respostaRelatorio = Map.of(
                "dadosGrafico", dadosGrafico,
                "dadosTabela", dadosTabela
            );

            return ResponseEntity.ok(respostaRelatorio);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro interno ao processar o relatório."));
        }
    }

    @GetMapping("/admin/relatorio-geral")
    public ResponseEntity<?> obterRelatorioGeralAdmin() {
        try {
            Map<String, Object> resposta = new HashMap<>();
            
            resposta.put("totalDatasets", datasetRepository.contarTotalDatasets());
            resposta.put("maisVistos", visualizacaoRepository.buscarTop5MaisVistos());
            resposta.put("maisBaixados", downloadRepository.buscarTop5MaisBaixados());
            
            return ResponseEntity.ok(resposta);
        } catch (Exception e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("message", "Erro ao processar o relatório do admin.");
            return ResponseEntity.status(500).body(erro);
        }
    }

    @DeleteMapping("/{id}/deletar")
    public ResponseEntity<?> deletarDataset(@PathVariable Long id) {
        try {
            int linhasAfetadas = datasetRepository.deletarPorId(id);
            
            if (linhasAfetadas == 0) {
                Map<String, String> resposta = new HashMap<>();
                resposta.put("message", "Dataset não encontrado.");
                return ResponseEntity.status(404).body(resposta);
            }

            Map<String, String> resposta = new HashMap<>();
            resposta.put("message", "Dataset e todas as suas dependências foram removidos com sucesso.");
            return ResponseEntity.ok(resposta);
            
        } catch (Exception e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("message", "Erro interno ao tentar remover o dataset.");
            return ResponseEntity.status(500).body(erro);
        }
    }
}
