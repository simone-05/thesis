package gruppo1.grafofuncmanager.Controller;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;

import gruppo1.grafofuncmanager.Functions.StringsFns;
import gruppo1.grafofuncmanager.Model.Edge;
import gruppo1.grafofuncmanager.Model.Flownode;
import gruppo1.grafofuncmanager.Model.Graph;
// import net.minidev.json.JSONObject;
import org.json.JSONObject;


@CrossOrigin("http://localhost:4200")
@RestController
// @RequestMapping("/api")
class GraphController {
    Graph graph;

    @PostMapping(value="/graph/update")
    public ResponseEntity<Graph> updateGraph(@RequestBody Graph graph) {
        try {
            this.graph = new Graph(graph.getName(), graph.getNodes(), graph.getEdges());
            
            return new ResponseEntity<>(graph, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @MessageMapping("/injection")
    // @SendTo("/topic/debug")
    public String processSocket(Flownode inject_node) {
        bfs(inject_node);
        return "Done";
    }

    private List<Flownode> getOutNodes(Flownode node) {
        List<Flownode> exit_nodes = new ArrayList<>();
        
        if (graph == null) {
            System.out.println("Graph is null");
        }

        try {
            Stream<Flownode> nodes = Stream.of(graph.getNodes());
            Stream<Edge> edges = Stream.of(graph.getEdges());

            List<String> exit_node_ids = edges.filter(e -> e.getSource().equals(node.getId())).map(e -> e.getTarget()).collect(Collectors.toList());

            exit_nodes = nodes.filter(n -> exit_node_ids.contains(n.getId())).collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("ERRORE getOutNodes(): "+e);
        }
        return exit_nodes;
    }

    private void bfs(Flownode input) {
        // boolean visited[] = new boolean[graph.getNodes().length];

        LinkedList<Flownode> queue = new LinkedList<Flownode>();

        // visited[graph.getNodeIndex(input)] = true;
        queue.add(input);

        while (queue.size() != 0) {
            Flownode current_node = queue.poll();
            // Debug:
            // System.out.print(current_node.getId()+" ");

            // Eseguo le funzioni proprie del nodo corrente
            processNode(current_node);

            Iterator<Flownode> i = getOutNodes(current_node).listIterator();
            while (i.hasNext()) {
                Flownode next_node = i.next();
                //Trasmetto il contenuto al prossimo nodo
                try {
                    next_node.setInput(current_node.getOutput());
                } catch(Exception e) {
                    System.out.println("Eccezione, probabilmente non c'è il nodo nel grafo (indice tornato -1): "+e);
                }
                // if (!visited[graph.getNodeIndex(next_node)]) {
                //     visited[graph.getNodeIndex(next_node)] = true;
                //     queue.add(next_node);
                // }
                queue.add(next_node);
            }
        }
    }

    private void processNode(Flownode node) {
        switch (node.getType()) {
            case "debug":
                sendResponse(node.getInput());
                break;
            case "inject":
                node.setOutput(node.getContent());
                break;
            case "foo":
                node.setOutput(fooFunc(node.getInput()));
                break;
            default:
                sendResponse("sono un tipo sconosciuto di nodo");
                node.setOutput(node.getInput());
                break;
        }
    }

    @Autowired
    SimpMessagingTemplate m;

    public void sendResponse(String str) {
        // JSONObject obj = new JSONObject(str);
        this.m.convertAndSend("/topic/debug", str);
    }

    public String selectField(JSONObject obj, String key) {
        String value = "";

        try {
            if (obj == null) {
                System.out.println("json is null");
            }
            if (!obj.has(key)) {
                System.out.println("json does not contain "+key);
            } else {
                value = obj.getString(key);
            }
        } catch (Exception e) {
            System.out.println("ERRORE selectField(): "+e);
        }
        
        return value;
    }

    public String fooFunc(String input) {
        String res = "";
        // Immaginando di avere già il nome del campo su cui vogliamo operare (invece di avelo specificato da user input e messo nel node.content)
        String node_content = "name";
        
        try {
            // Port l'input in json
            JSONObject obj = new JSONObject(input);

            // Seleziono il campo
            String value = selectField(obj, node_content);
            obj.put(node_content, StringsFns.getInstance().toUpper(value));
            // Salvo il nuovo json e lo porto a stringa
            res = obj.toString();
        } catch (Exception e) {
            System.out.println("ERRORE fooFunc(): "+e);
        }
        
        StringsFns.getInstance().toUpper(input);
        
        return res;
    }
}
