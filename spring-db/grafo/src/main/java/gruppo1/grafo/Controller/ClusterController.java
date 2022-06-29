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

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api")
public class ClusterController {

    @Autowired
    ClusterRepository clusterRepository;

    @GetMapping("/clusters")
    public ResponseEntity<List<Cluster>> getAllclusters(@RequestParam(required = false) String id) {
        try {
            List<Cluster> clusters = new ArrayList<Cluster>();

            if (id == null)
                clusterRepository.findAll().forEach(clusters::add);
            else
                clusterRepository.findByIdContaining(id).forEach(clusters::add);

            if (clusters.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(clusters, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/clusters/{id}")
    public ResponseEntity<Cluster> getclusterByid(@PathVariable("id") String id) {
        Optional<Cluster> clusterData = clusterRepository.findById(id);

        if (clusterData.isPresent()) {
            return new ResponseEntity<>(clusterData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/clusters")
    public ResponseEntity<Cluster> createcluster(@RequestBody Cluster cluster) {
        try {
            Cluster _cluster = clusterRepository
                    .save(new Cluster(cluster.getId(), cluster.getLabel(), cluster.getChildNodeIds(), cluster.getData(), cluster.getDimension(), cluster.getMeta(), cluster.getPosition(), cluster.getWidth(), cluster.getX(), cluster.getY()));
            return new ResponseEntity<>(_cluster, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/clusters/{id}")
    public ResponseEntity<Cluster> updatecluster(@PathVariable("id") String id, @RequestBody Cluster cluster) {
        Optional<Cluster> clusterData = clusterRepository.findById(id);

        if (clusterData.isPresent()) {
            Cluster _cluster = clusterData.get();
            _cluster.setId(cluster.getId());
            _cluster.setLabel(cluster.getLabel());
            return new ResponseEntity<>(clusterRepository.save(_cluster), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/clusters/{id}")
    public ResponseEntity<HttpStatus> deletecluster(@PathVariable("id") String id) {
        try {
            clusterRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/clusters")
    public ResponseEntity<HttpStatus> deleteAllclusters() {
        try {
            clusterRepository.deleteAll();
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
