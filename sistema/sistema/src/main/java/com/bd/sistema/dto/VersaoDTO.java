package com.bd.sistema.dto;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public record VersaoDTO(int datasetId, int contaId, String numVersao, String descricaoModificacoes, Integer versaoBaseId, MultipartFile arquivo,
                        List<String> featureNome, List<String> featureTipo, List<String> featureDescricao) {}