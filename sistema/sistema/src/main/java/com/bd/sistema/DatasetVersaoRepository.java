package com.bd.sistema;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

@Repository
public interface DatasetVersaoRepository extends JpaRepository<DatasetVersao,Integer> {
    List<DatasetVersao> findByDatasetId(Integer datasetId);
}