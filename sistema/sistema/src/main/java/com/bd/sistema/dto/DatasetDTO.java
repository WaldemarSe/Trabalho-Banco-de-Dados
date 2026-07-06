package com.bd.sistema.dto;

import org.springframework.web.multipart.MultipartFile;

public record DatasetDTO(String nome, String descricao, String fontes, boolean ePrivado, int contaId, 
                         String numVersao, String descricaoModificacoes, MultipartFile arquivo) {}