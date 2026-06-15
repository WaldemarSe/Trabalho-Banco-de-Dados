package com.bd.sistema;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DatasetRepository extends JpaRepository<Dataset,Integer> { 
    @Query("SELECT d FROM Dataset d WHERE d.criador.id = :criadorId OR d.ePrivado = false")
    List<Dataset> BuscarPorCriadorOuPublico(@Param("criadorId") Integer criadorId);
}