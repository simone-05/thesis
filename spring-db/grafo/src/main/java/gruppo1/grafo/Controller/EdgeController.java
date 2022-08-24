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
@RequestMapping("/api")
public class EdgeController {

    @Autowired
    EdgeRepository edgeRepository;

    @GetMapping("/edges")
    public ResponseEntity<List<Edge>> getAlledges(@RequestParam(required = false) String id) {
        try {
            List<Edge> edges = new ArrayList<Edge>();

            if (id == null)
                edgeRepository.findAll().forEach(edges::add);
            else
                edgeRepository.findByIdContaining(id).forEach(edges::add);

            if (edges.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(edges, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/edges/{id}")
    public ResponseEntity<Edge> getedgeByid(@PathVariable("id") String id) {
        Optional<Edge> edgeData = edgeRepository.findById(id);

        if (edgeData.isPresent()) {
            return new ResponseEntity<>(edgeData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/edges")
    public ResponseEntity<Edge> createedge(@RequestBody Edge edge) {
        try {
            Edge _edge = edgeRepository
                    .save(new Edge(edge.getId(), edge.getLabel(), edge.getSource(), edge.getTarget(), edge.getWeight()));
            return new ResponseEntity<>(_edge, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/edges/{id}")
    public ResponseEntity<Edge> updateedge(@PathVariable("id") String id, @RequestBody Edge edge) {
        Optional<Edge> edgeData = edgeRepository.findById(id);

        if (edgeData.isPresent()) {
            Edge _edge = edgeData.get();
            _edge.setId(edge.getId());
            _edge.setLabel(edge.getLabel());
            return new ResponseEntity<>(edgeRepository.save(_edge), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/edges/{id}")
    public ResponseEntity<HttpStatus> deleteedge(@PathVariable("id") String id) {
        try {
            edgeRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/edges")
    public ResponseEntity<HttpStatus> deleteAlledges() {
        try {
            edgeRepository.deleteAll();
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
