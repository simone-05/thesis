package gruppo1.grafofuncmanager.Controller;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;
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

import gruppo1.grafofuncmanager.Functions.NumbersFns;
import gruppo1.grafofuncmanager.Functions.StringsFns;
import gruppo1.grafofuncmanager.Model.Edge;
import gruppo1.grafofuncmanager.Model.Flownode;
import gruppo1.grafofuncmanager.Model.Graph;

import org.json.JSONArray;
import org.json.JSONException;
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

    /**
     * Breadth first search, visita del grafo per trasmettere il messaggio ed eseguire le operaioni man mano
     * @param input
     */
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
            if (!processNode(current_node)) {
                sendNodeResultStatus("error", current_node);
                continue; //Se va in errore durante le operazioni, non processo i suoi figli
            }
            sendNodeResultStatus("success", current_node);

            Iterator<Flownode> i = getOutNodes(current_node).listIterator();
            while (i.hasNext()) {
                Flownode next_node = i.next();
                //Trasmetto il contenuto al prossimo nodo
                try {
                    if (!transmitMessage(current_node, next_node)) continue;
                } catch(Exception e) {
                    System.out.println("Eccezione, forse non c'è il nodo nel grafo (indice tornato -1): "+e);
                }
                // if (!visited[graph.getNodeIndex(next_node)]) {
                //     visited[graph.getNodeIndex(next_node)] = true;
                //     queue.add(next_node);
                // }
                queue.add(next_node);
            }
        }
    }

    /**
     * Copies the 'output' of the 'current' node to the 'input' of the 'next' node
     * @param current the node with the input to copy from
     * @param next the node with the output to copy to
     */
    private boolean transmitMessage(Flownode current, Flownode next) {
        if (next.getType().equals("inject")) return false;
        else if (current.getType().equals("debug")) return false;
        else if (current.getType().equals("mongo-out")) return false;

        // Altrimenti possiamo trasmettere il messaggio al prossimo nodo
        next.setInput(current.getOutput());
        return true;
    }

    /**
     * Per il nodo in input, in base al suo tipo, prende il suo 'input' e grazie al suo 'content' produce il messaggio risultante nel suo 'output'
     * @param node
     * @return true se le operazioni sono andate a buon fine, false altrimenti
     */
    private boolean processNode(Flownode node) {
        try {
            switch (node.getType()) {
                case "debug":
                if (!node.getInput().isEmpty()) {
                    sendResponse(node.getInput(), node.getId());
                    return true;
                }
            case "inject":
                node.setOutput(node.getContent());
                return true;
            case "string-ops":
                return stringFunc(node);
            case "number-ops":
                return numberFunc(node);
            case "fields-sel":
                return fieldsSelectFunc(node);
            case "mongo-in":
                return mongoImport(node);
            case "mongo-out":
                return mongoWrite(node);
            // case "fields-del":
            //     return deleteFields(node);
            default:
                node.setOutput(nodeError(node, "Unknown node type"));
                return false;
            }
        } catch(Exception e) {
            System.out.println("\nERRORE: errore nella funzione 'processNode' col nodo: "+ node.getId()+", Descrizione: "); //sulla console di questo processo springboot
            e.printStackTrace();
            node.setOutput(nodeError(node, "Unknown node error")); // cosi stampo anche sulla console di chrome
            return false;
        }
    }

    @Autowired
    SimpMessagingTemplate m;

    /**
     * Invia al client un messaggio di log/status per indicare se il nodo ha operato con successo o meno
     * @param str 'success' o 'error' in base alla conclusioni delle operazioni del nodo
     * @param id l'id del nodo
     */
    public void sendNodeResultStatus(String str, Flownode node) {
        JSONObject obj = new JSONObject();
        obj.put("node_id", node.getId());
        obj.put("node_input", node.getInput());
        obj.put("node_output", node.getOutput());
        obj.put("status", str);
        this.m.convertAndSend("/topic/debug", obj.toString());
    }

    /**
     * Invia al client la websocket con il dato finale ottenuto. Ovvero ciò che fa il nodo di debug, o altri nodi nel caso vadano in errore.
     * @param str il dato/messaggio risultato
     * @param id l'id del nodo di riferimento, per distinguerlo
     */
    public void sendResponse(String str, String id) {
        JSONObject obj = new JSONObject();
        obj.put("node_id", id);
        obj.put("message", new JSONObject(str));
        this.m.convertAndSend("/topic/debug", obj.toString());
    }

    /**
     * Creates an error msg and sends it as debug
     * @param node node went to error
     * @param error_msg the message/reason of the error as String
     * @return json error as string
     */
    private String nodeError(Flownode node, String error_msg) {
        JSONObject error_json = new JSONObject();
        error_json.put("ERROR", error_msg);
        sendResponse(error_json.toString(), node.getId());
        return error_json.toString();
    }

    /**
     * Funzione custom per safely select a field from given json
     * @param obj il json su cui operare
     * @param key il campo da selezionare
     * @return Il value del campo selezionato
     */
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

    /**
     * La funzione dei nodi di tipo 'string-ops', per costruire l' 'output' dato il suo 'input' e le operazioni nel 'content'
     * @param node 
     * @return il dato/messaggio processato
     */
    public boolean stringFunc(Flownode node) {
        JSONObject input_json = new JSONObject(node.getInput());
        JSONObject content = new JSONObject(node.getContent());
        String op = content.getString("operation"); // L'operazione da effettuare
        List<String> fields = new ArrayList<>();
        for (Object obj : content.getJSONArray("fields")) {
            fields.add(obj.toString());
        }
        List<String> input_fields_values = new ArrayList<>();
        String sub_op = ""; // Il nome della sub-operazione
        String regex_pattern = "";
        Pattern pattern = null;
        String output = ""; // La stringa json che scriveremo come output

        // Controllo che esista e non sia nullo il campo selezionato, nell'input
        String error_field = "";
        try {
            for (String field : fields) {
                error_field = field;
                if (input_json.isNull(error_field)) {
                    node.setOutput(nodeError(node, "Field: '" + error_field + "' is null or doesn't exist"));
                    return false;
                }
                input_fields_values.add(input_json.getString(field));
            }
        } catch(JSONException je) {
            node.setOutput(nodeError(node, "Field: '" + error_field + "' of specified type not found in input data"));
            return false;
        }

        // Controllo stringa non vuota
        for (String value : input_fields_values) {
            if (value == null || value.isBlank() || value.isEmpty()) {
                node.setOutput(nodeError(node, "Value of '"+fields.get(input_fields_values.indexOf(value))+"' is either blank, null or empty"));
                return false;
            }
        }
        
        // Vari controlli su regex, che sia presente nel json e che sia valido
        if (op.equals("regex")) {
            try {
                sub_op = content.getString("sub-operation");
            } catch(JSONException e) {
                node.setOutput(nodeError(node, "Couldn't find 'sub-operation' field value"));
                return false;
            }
            try {
                regex_pattern = content.getString("regex");
                pattern = Pattern.compile(regex_pattern);
            } catch(JSONException e) {
                node.setOutput(nodeError(node, "No input regex pattern"));
                return false;
            } catch(PatternSyntaxException e) {
                node.setOutput(nodeError(node, "Error in the regular expression pattern"));
                return false;
            }
        }
        
        List<String> res = new ArrayList<String>(input_fields_values);

        switch (op) {
            case "upper":
                res = res.stream().map(x -> StringsFns.getInstance().toUpper(x)).collect(Collectors.toList());
                break;
            case "lower":
                res = res.stream().map(x -> StringsFns.getInstance().toLower(x)).collect(Collectors.toList());
                break;
            case "regex":
                for (int i = 0; i < input_fields_values.size(); i++) {
                    String input_value = input_fields_values.get(i);
                    Matcher matcher = pattern.matcher(input_value);
                    // boolean matchFound = matcher.find();
                    List<Integer> starts = new ArrayList<>();
                    List<Integer> ends = new ArrayList<>();
                    while (matcher.find()) {
                        starts.add(matcher.start());
                        ends.add(matcher.end());

                        // f(matcher.groupCount()); //0 //0
                        // // Non fa fare il while
                        // // f(matcher.results().count()); //1 //0
                    }
                    switch(sub_op) {
                        case "delete":
                            input_value = input_value.replaceAll(regex_pattern, "");
                            break;
                        case "keep":
                            input_value = input_value.replaceAll("/^((?!"+regex_pattern+").)*$/", "");
                            break;
                        case "replace":
                            String replace_string = "";
                            try {
                                replace_string = content.getString("replace");
                            } catch(Exception e) {
                                output = nodeError(node, "No 'replace' field in node content");
                                return false;
                            }
                            input_value = input_value.replaceAll(regex_pattern, replace_string);
                            break;
                        default: break;
                    }
                    res.set(i, input_value);
                }
                // while (matcher.find()) {
                //     // matcher.
                //     String m = matcher.group();
                //     System.out.println(m);
                // }
                // if(matchFound) {
                //     System.out.println("Match found");
                // } else {
                //     System.out.println("Match not found");
                // }
                // System.out.println(matcher.group());
                // System.out.println(matcher.toString());
                break;
            default:
                break;
        }
            
        for (int i = 0; i < res.size(); i++) {
            input_json.put(fields.get(i), res.get(i));
        }
        output = input_json.toString();
        node.setOutput(output);
        return true;
    }

    /**
     * @param node
     * @return
     */
    public boolean numberFunc(Flownode node) {
        JSONObject input_json = new JSONObject(node.getInput());
        JSONObject content = new JSONObject(node.getContent());
        String op = content.getString("operation"); // L'operazione da effettuare
        List<String> fields = new ArrayList<>();
        for (Object obj : content.getJSONArray("fields")) {
            fields.add(obj.toString());
        }
        List<Double> input_fields_values = new ArrayList<>();
        // String sub_op = ""; // Il nome della sub-operazione
        String output = ""; // La stringa json che scriveremo come output
        Integer digits = 0;

        // Controllo che esista e non sia nullo il campo selezionato, nell'input
        String error_field = "";
        try {
            for (String field : fields) {
                error_field = field;
                if (input_json.isNull(error_field)) {
                    node.setOutput(nodeError(node, "Field: '"+error_field+"' is null or doesn't exist"));
                    return false;
                }
                input_fields_values.add(input_json.getDouble(field));
            }
        } catch (JSONException je) {
            node.setOutput(nodeError(node, "Field: '"+error_field+"' of specified type not found in input data"));
            return false;
        }

        if (op.equals("trim") || op.equals("round")) {
            try {
                digits = content.getInt("digits");
            } catch (JSONException e) {
                node.setOutput(nodeError(node, "No digits number specified"));
                return false;
            }
        }

        List<Double> res = new ArrayList<Double>(input_fields_values);
        
        switch(op) {
            case "integer":
                res = res.stream().map(x -> NumbersFns.getInstance().getInt(x)).collect(Collectors.toList());
                break;
            case "trim":
                // res = res.stream().map(x -> NumbersFns.getInstance().trimDecimals(x, digits)).collect(Collectors.toList());
                for (int i = 0; i < res.size(); i++) {
                    res.set(i, NumbersFns.getInstance().trimDecimals(res.get(i), digits));
                }
                break;
            case "round":
                // res = res.stream().map(x -> NumbersFns.getInstance().round(x, digits)).collect(Collectors.toList());
                for (int i = 0; i < res.size(); i++) {
                    res.set(i, NumbersFns.getInstance().roundDecimals(res.get(i), digits));
                }
                break;
            case "non_negative":
                for (int i = 0; i < res.size(); i++) {
                    res.set(i, NumbersFns.getInstance().isNonNegative(res.get(i)));
                }
            default: break;
        }

        for (int i = 0; i < res.size(); i++) {
            input_json.put(fields.get(i), res.get(i));
        }
        output = input_json.toString();
        node.setOutput(output);
        return true;
    }

    public boolean fieldsSelectFunc(Flownode node) {
        final JSONObject input_json = new JSONObject(node.getInput());
        final JSONObject content_json = new JSONObject(node.getContent());
        final String op = content_json.getString("operation"); // L'operazione da effettuare
        final List<String> content_fields_list = new ArrayList<>();
        for (Object obj : content_json.getJSONArray("fields")) {
            content_fields_list.add(obj.toString());
        }
        JSONObject output_json = input_json; // Il json che scriveremo come output
        
        // Controllo che esista il campo selezionato, nell'input
        for (String field : content_fields_list) {
            if (!input_json.has(field)) {
                node.setOutput(nodeError(node, "Field: '" + field + "' doesn't exist"));
                return false;
            }
        }
        
        switch (op) {
            case "select":
                for (Iterator<String> iterator = output_json.keys(); iterator.hasNext(); ) {
                    String value = iterator.next();
                    if (!content_fields_list.contains(value)) {
                        iterator.remove();
                    }
                }
                break;
            case "deselect":
                for (Iterator<String> iterator = output_json.keys(); iterator.hasNext();) {
                    String value = iterator.next();
                    if (content_fields_list.contains(value)) {
                        iterator.remove();
                    }
                }
                break;
            default:
                break;
        }

        node.setOutput(output_json.toString());
        return true;
    }

    public boolean mongoImport(Flownode node) {
        final JSONObject content_json = new JSONObject(node.getContent());
        final String database = content_json.getString("db");
        final String collection = content_json.getString("collection");
        JSONObject output_json = new JSONObject(); // Il json che scriveremo come output
        

        node.setOutput(output_json.toString());
        return false;
    }

    public boolean mongoWrite(Flownode node) {
        return false;
    }
    
    /**
     * La funzione dei nodi di tipo 'fields-del'
     * @param node
     * @return il messaggio/dato processato
     */
    public boolean deleteFields(Flownode node) {
        JSONObject input_json = new JSONObject(node.getInput());
        JSONObject content = new JSONObject(node.getContent());
        // List<String> fields = new ArrayList<>();
        JSONArray ja = content.getJSONArray("fields");
        for (int i = 0; i < ja.length(); i++) {
            // fields.add(ja.getString(i));
            input_json.remove(ja.getString(i));
        }

        String input = input_json.toString();
        String res = input;
        
        node.setOutput(res);
        return true;
    }
}
