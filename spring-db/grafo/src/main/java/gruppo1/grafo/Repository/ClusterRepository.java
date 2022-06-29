package gruppo1.grafo.Repository;

import gruppo1.grafo.Model.*;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ClusterRepository extends MongoRepository<Cluster, String> {
    List<Cluster> findByIdContaining(String id);
}
