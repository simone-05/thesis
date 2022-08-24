package gruppo1.grafo.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import gruppo1.grafo.Model.*;
import gruppo1.grafo.Repository.*;

@CrossOrigin(origins = "*") // cambia da localhost:4200 a *, per poter funzionare nel network docker
@RestController
@RequestMapping("/api") //tutte le url iniziano con /api/...
public class GraphController {

    @Autowired
    GraphRepository graphRepository;

    @GetMapping("/graphs")
    public ResponseEntity<List<Graph>> getAllgraphs(@RequestParam(required = false) String name) {
        try {
            List<Graph> graphs = new ArrayList<Graph>();

            if (name == null) {
                graphRepository.findAll().forEach(graphs::add);
            }
            else
                graphRepository.findByNameContaining(name).forEach(graphs::add);

            if (graphs.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(graphs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/graphs/{name}")
    public ResponseEntity<Graph> getgraphByName(@PathVariable("name") String name) {
        Optional<Graph> graphData = graphRepository.findById(name);

        if (graphData.isPresent()) {
            return new ResponseEntity<>(graphData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/graphs")
    public ResponseEntity<Graph> creategraph(@RequestBody Graph graph) {
        try {
            Graph _graph = graphRepository
                    .save(new Graph(graph.getName(), graph.getDescription(), graph.getDate(), graph.getNodes(), graph.getEdges(), graph.getClusters()));
            return new ResponseEntity<>(_graph, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/graphs/{name}")
    public ResponseEntity<Graph> updategraph(@PathVariable("name") String name, @RequestBody Graph graph) {
        Optional<Graph> graphData = graphRepository.findById(name);

        if (graphData.isPresent()) {
            Graph _graph = graphData.get();
            _graph.setName(graph.getName());
            _graph.setDescription(graph.getDescription());
            return new ResponseEntity<>(graphRepository.save(_graph), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/graphs/{name}")
    public ResponseEntity<HttpStatus> deletegraph(@PathVariable("name") String name) {
        try {
            graphRepository.deleteById(name);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/graphs")
    public ResponseEntity<HttpStatus> deleteAllgraphs() {
        try {
            graphRepository.deleteAll();
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value="/graphs/find/{name}")
    public ResponseEntity<Boolean> findgraph(@PathVariable("name") String name) {
        Optional<Graph> graph = graphRepository.findById(name);

        if (graph.isPresent()) {
            return new ResponseEntity<Boolean>(true, HttpStatus.OK);
        } else {
            return new ResponseEntity<Boolean>(false, HttpStatus.OK);
        }
    }
}
