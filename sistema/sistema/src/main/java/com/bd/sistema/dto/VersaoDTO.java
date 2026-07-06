package com.bd.sistema.dto;

import org.springframework.web.multipart.MultipartFile;

public record VersaoDTO(int datasetId, int contaId, String numVersao, String descricaoModificacoes, Integer versaoBaseId, MultipartFile arquivo) {}