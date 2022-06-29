// package gruppo1.grafo.Controller;

// // import org.springframework.data.repository.CrudRepository;
// // import org.springframework.data.rest.core.annotation.RepositoryRestResource;

// //Remove @RepositoryRestResource below to disable auto REST api:
// @RepositoryRestResource
// public interface repositoryName extends CrudRepository<entityName, entityIdType>{}

package gruppo1.grafo.Repository;

import gruppo1.grafo.Model.*;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;


public interface GraphRepository extends MongoRepository<Graph, String> {
  // List<Graph> findByPublished(boolean published);
  List<Graph> findByNameContaining(String name);
}
