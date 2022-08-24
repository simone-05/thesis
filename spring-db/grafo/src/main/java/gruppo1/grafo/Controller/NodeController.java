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

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api") // tutte le url iniziano con /api/...
public class NodeController {

    @Autowired
    NodeRepository nodeRepository;

    @GetMapping("/nodes")
    public ResponseEntity<List<Node>> getAllnodes(@RequestParam(required = false) String id) {
        try {
            List<Node> nodes = new ArrayList<Node>();

            if (id == null)
                nodeRepository.findAll().forEach(nodes::add);
            else
                nodeRepository.findByIdContaining(id).forEach(nodes::add);

            if (nodes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(nodes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/nodes/{id}")
    public ResponseEntity<Node> getnodeByid(@PathVariable("id") String id) {
        Optional<Node> nodeData = nodeRepository.findById(id);

        if (nodeData.isPresent()) {
            return new ResponseEntity<>(nodeData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/nodes")
    public ResponseEntity<Node> createnode(@RequestBody Node node) {
        try {
            Node _node = nodeRepository
                    .save(new Node(node.getId(), node.getLabel(), node.getType(), node.getProperties(), node.getContent(), node.getInput(), node.getOutput(), node.getData(), node.getDimension(), node.getMeta(), node.getPosition()));
            return new ResponseEntity<>(_node, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/nodes/{id}")
    public ResponseEntity<Node> updatenode(@PathVariable("id") String id, @RequestBody Node node) {
        Optional<Node> nodeData = nodeRepository.findById(id);

        if (nodeData.isPresent()) {
            Node _node = nodeData.get();
            _node.setId(node.getId());
            _node.setLabel(node.getLabel());
            return new ResponseEntity<>(nodeRepository.save(_node), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/nodes/{id}")
    public ResponseEntity<HttpStatus> deletenode(@PathVariable("id") String id) {
        try {
            nodeRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/nodes")
    public ResponseEntity<HttpStatus> deleteAllnodes() {
        try {
            nodeRepository.deleteAll();
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
