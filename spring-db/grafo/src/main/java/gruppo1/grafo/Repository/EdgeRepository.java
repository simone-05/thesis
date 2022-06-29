package gruppo1.grafo.Repository;

import gruppo1.grafo.Model.*;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface EdgeRepository extends MongoRepository<Edge, String> {
    List<Edge> findByIdContaining(String id);
}
