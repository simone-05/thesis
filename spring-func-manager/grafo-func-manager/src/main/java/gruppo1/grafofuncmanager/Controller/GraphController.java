package gruppo1.grafofuncmanager.Controller;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.Map.Entry;
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

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoCollection;
// import com.mongodb.reactivestreams.client.MongoClient;
// import com.mongodb.reactivestreams.client.MongoClients;
// import com.mongodb.reactivestreams.client.MongoDatabase;
// import com.mongodb.reactivestreams.client.MongoCollection;

import com.google.gson.Gson;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.InvalidPathException;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.JsonPathException;

import gruppo1.grafofuncmanager.Functions.NumbersFns;
import gruppo1.grafofuncmanager.Functions.StringsFns;
import gruppo1.grafofuncmanager.Model.Edge;
import gruppo1.grafofuncmanager.Model.Flownode;
import gruppo1.grafofuncmanager.Model.Graph;
import gruppo1.grafofuncmanager.Prom;
import io.prometheus.client.Counter;

import org.bson.Document;
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
                    String output = new JSONObject(node.getInput()).getJSONArray("data").toString();
                    sendResponse(output, node.getId());
                    return true;
                }
            case "inject":
                node.setOutput(node.getContent());
                return true;
            case "string-ops":
                return stringFunc(node);
            case "number-ops":
                return numberFunc(node);
            case "number-agg":
                return numberAgg(node);
            case "fields-sel":
                return fieldsSelectFunc(node);
            // case "fields-del":
            //     return deleteFields(node);
            case "mongo-in":
                return mongoImport(node);
            case "mongo-out":
                return mongoWrite(node);
            case "prometheus":
                return prometheus(node);
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
        obj.put("message", new JSONArray(str));
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
        JSONObject obj = new JSONObject();
        obj.put("node_id", node.getId());
        obj.put("message", error_json);
        this.m.convertAndSend("/topic/debug", obj.toString());
        return error_json.toString();
    }

    private String setSingleValues(String path, JSONArray new_values, String data) {
        int asterisk = -1;
        for (int i=1;i<path.length();i++) {
            if (path.charAt(i-1) == '[' && path.charAt(i) == '*') {
                asterisk = i;
            }
        }

        if (asterisk == -1) return "";
        for (int j = 0; j < new_values.length(); j++) {
            String cur_path = (path.substring(0, asterisk) + j + path.substring(asterisk + 1, path.length()));
            try {
                data = JsonPath.parse(data).set(cur_path, new_values.get(j)).jsonString();
            } catch (com.jayway.jsonpath.PathNotFoundException e) {
                System.out.println("Path non trovato");
                e.printStackTrace();
                continue;
            }
        }
        return data;
    }

    /**
     * Funzione per processare un JsonPath path, con la sua sintassi, e ottenere una lista dei singoli path fino alle chiavi, ad esempio $.[2-4].a otteniamo ["$.[2].a", "$.[3].a"]
     * @param query la stringa immessa nel campo 'field' dei nodi
     * @param data il json array della chiave 'data' dell'input come stringa
     * @return L'array con i vari path alle chiavi singoli
     */
    private List<String> jsonQuery(String data, String query) {
        List<String> res = new ArrayList<>();
        Integer paths_count = 0;

        if (JsonPath.read(data, query).toString().charAt(0) != '[') {
            // Un solo campo
            res.add(query);
        } else {
            // Sono più campi
            net.minidev.json.JSONArray json_values = JsonPath.read(data, query);
            paths_count = json_values.size(); //per controllare se il numero coincide dopo
            Object[] values = json_values.toArray(); //per controllare se i valori sono giusti

            List<String> path_list = new ArrayList<String>();
            String[] s = query.split("[.]");
            for (int i = 0; i < s.length; i++) {
                path_list.add(s[i]);
            }
            for (int i = 0; i < path_list.size(); i++) {
                String path_piece = path_list.get(i);
                Pattern pattern = Pattern.compile("^\\w|\\[\\?|\\[\"|\\[\\d\\]|\\[-\\d\\]");
                Matcher matcher = pattern.matcher(path_piece);
                while (matcher.find()) {
                    path_list.remove(path_piece);
                }
            }
            for (int i=0;i<path_list.size();i++) {
                int index = query.indexOf(path_list.get(i));
                String single_path = query.substring(0, index+(path_list.get(i).length()));
                System.out.println(single_path); //mostra il path fino al primo array
            }
        }
        
        return res;
    }

    /**
     * La funzione dei nodi di tipo 'string-ops', per costruire l' 'output' dato il suo 'input' e le operazioni nel 'content'
     * @param node 
     * @return il dato/messaggio processato
     */
    public boolean stringFunc(Flownode node) {
        String data = new JSONObject(node.getInput()).getJSONArray("data").toString();
        Integer doc_count = new JSONArray(data).length();
        JSONObject content = new JSONObject(node.getContent());
        String op = content.getString("operation"); // L'operazione da effettuare
        List<String> fields = new ArrayList<>();
        for (Object obj : content.getJSONArray("fields")) {
            fields.add(obj.toString());
        }
        String regex_pattern = "";
        Pattern pattern = null;

        jsonQuery(new JSONObject(node.getInput()).getJSONArray("data").get(0).toString(), fields.get(0));

        // Catch errors for each field: type is not double, the field is not present in
        // all documents
        for (String field : fields) {
            List<Double> l;
            try {
                l = JsonPath.read(data, "$.[*]." + field);
            } catch (Exception e) {
                node.setOutput(nodeError(node, "Field '" + field + "' is not a double"));
                return false;
            }
            if (l.size() == 0) {
                node.setOutput(nodeError(node, "No document has the field: '" + field + "'"));
                return false;
            }
        }
        
        // Vari controlli su regex, che sia presente nel json e che sia valido
        String sub_op = ""; // Il nome della sub-operazione
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

        switch (op) {
            case "upper":
                for (String field : fields) {
                    for (int i = 0; i < doc_count; i++) {
                        String path = "$.[" + i + "]." + field;
                        String s = JsonPath.read(data, path).toString();
                        if (s.charAt(0) == '[') { // if the result is an array
                            net.minidev.json.JSONArray old_values = JsonPath.parse(data).read(path);
                            JSONArray new_values = new JSONArray(old_values);
                            for (int j = 0; j < new_values.length(); j++) {
                                new_values.put(j, StringsFns.getInstance().toUpper(new_values.getString(j)));
                            }
                            if ((data = setSingleValues(path, new_values, data)).equals("")) {
                                node.setOutput(nodeError(node, "Can't find asterisk in path"));
                                return false;
                            }
                        } else {
                            data = JsonPath.parse(data).set(path, StringsFns.getInstance().toLower(s)).jsonString();
                        }
                    }
                }
                // res = res.stream().map(x -> StringsFns.getInstance().toUpper(x)).collect(Collectors.toList());
                break;
            case "lower":
                for (String field : fields) {
                    for (int i = 0; i < doc_count; i++) {
                        String path = "$.[" + i + "]."+field;
                        String s = JsonPath.read(data, path).toString();
                        if (s.charAt(0) == '[') { //if the result is an array
                            net.minidev.json.JSONArray old_values = JsonPath.parse(data).read(path);
                            JSONArray new_values = new JSONArray(old_values);
                            for (int j = 0; j < new_values.length(); j++) {
                                new_values.put(j, StringsFns.getInstance().toLower(new_values.getString(j)));
                            }
                            if ((data = setSingleValues(path, new_values, data)).equals("")) {
                                node.setOutput(nodeError(node, "Can't find asterisk in path"));
                                return false;
                            }
                        } else {
                            data = JsonPath.parse(data).set(path, StringsFns.getInstance().toLower(s)).jsonString();
                        }
                    }
                }
                // res = res.stream().map(x -> StringsFns.getInstance().toLower(x)).collect(Collectors.toList());
                break;
            case "regex":
                for (String field : fields) {
                    for (int i = 0; i < doc_count; i++) {
                        String path = "$.[" + i + "]." + field;
                        String s = JsonPath.read(data, path).toString();
                        if (s.charAt(0) == '[') { // if the result is an array
                            net.minidev.json.JSONArray old_values = JsonPath.parse(data).read(path);
                            JSONArray new_values = new JSONArray(old_values);
                            for (int j = 0; j < new_values.length(); j++) {
                                switch (sub_op) {
                                    case "delete":
                                        new_values.put(j, new_values.getString(j).replaceAll(regex_pattern, ""));
                                        break;
                                    case "keep":
                                        new_values.put(j, new_values.getString(j).replaceAll("/^((?!" + regex_pattern + ").)*$/", ""));
                                        break;
                                    case "replace":
                                        String replace_string = "";
                                        try {
                                            replace_string = content.getString("replace");
                                        } catch (Exception e) {
                                            node.setOutput(nodeError(node, "No 'replace' field in node content"));
                                            return false;
                                        }
                                        new_values.put(j, new_values.getString(j).replaceAll(regex_pattern, replace_string));
                                        break;
                                    default:
                                        break;
                                }
                            }
                            if ((data = setSingleValues(path, new_values, data)).equals("")) {
                                node.setOutput(nodeError(node, "Can't find asterisk in path"));
                                return false;
                            }
                        } else {
                            switch (sub_op) {
                                case "delete":
                                    s = s.replaceAll(regex_pattern, "");
                                    break;
                                case "keep":
                                    s = s.replaceAll("/^((?!" + regex_pattern + ").)*$/", "");
                                    break;
                                case "replace":
                                    String replace_string = "";
                                    try {
                                        replace_string = content.getString("replace");
                                    } catch (Exception e) {
                                        node.setOutput(nodeError(node, "No 'replace' field in node content"));
                                        return false;
                                    }
                                    s = s.replaceAll(regex_pattern, replace_string);
                                    break;
                                default:
                                    break;
                            }
                            data = JsonPath.parse(data).set(path, s).jsonString();
                        }
                    }
                }            
                        
                        // Matcher matcher = pattern.matcher(value);
                        // List<Integer> starts = new ArrayList<>();
                        // List<Integer> ends = new ArrayList<>();
                        // while (matcher.find()) {
                        //     starts.add(matcher.start());
                        //     ends.add(matcher.end());
                        // }
                break;
            default:
                break;
        }

        JSONObject output_json = new JSONObject().put("data", new JSONArray(data));
        node.setOutput(output_json.toString());
        return true;
    }

    /**
     * @param node
     * @return
     */
    public boolean numberFunc(Flownode node) {
        String data = new JSONObject(node.getInput()).getJSONArray("data").toString();
        Integer doc_count = new JSONArray(data).length();
        JSONObject content = new JSONObject(node.getContent());
        String op = content.getString("operation"); // L'operazione da effettuare
        // // String sub_op = ""; // Il nome della sub-operazione
        List<String> fields = new ArrayList<>();
        for (Object obj : content.getJSONArray("fields")) {
            fields.add(obj.toString());
        }
        
        // Catch errors for each field: type is not double, the field is not present in all documents
        for (String field : fields) {
            List<Double> l;
            try {
                l = JsonPath.read(data, "$.[*]."+field);
            } catch (InvalidPathException e) {
                node.setOutput(nodeError(node,  "Invalid field path syntax: '"+field+"'"));
                return false;
            }
            if (l.size() == 0) {
                node.setOutput(nodeError(node, "No document has the field: '" + field + "'"));
                return false;
            }
        }

        switch(op) {
            case "integer":
                for (String field : fields) {
                    for (int i = 0; i < doc_count; i++) {
                        String path = "$.[" + i + "]." + field;
                        String s = JsonPath.read(data, path).toString();
                        if (s.charAt(0) == '[') { // if the result is an array
                            net.minidev.json.JSONArray old_values = JsonPath.parse(data).read(path);
                            JSONArray new_values = new JSONArray(old_values);
                            for (int j = 0; j < new_values.length(); j++) {
                                new_values.put(j, NumbersFns.getInstance().getInt(new_values.getDouble(j)));
                            }
                            if ((data = setSingleValues(path, new_values, data)).equals("")) {
                                node.setOutput(nodeError(node, "Can't find asterisk in path"));
                                return false;
                            }
                        } else {
                            data = JsonPath.parse(data).set(path, NumbersFns.getInstance().getInt(Double.valueOf(s))).jsonString();
                        }
                    }
                }
                // res = res.stream().map(x -> NumbersFns.getInstance().getInt(x)).collect(Collectors.toList());
                break;
            case "round":
                // res = res.stream().map(x -> NumbersFns.getInstance().round(x, digits)).collect(Collectors.toList());
                Integer digits = content.getInt("digits");
                // for (int i = 0; i < res.size(); i++) {
                //     res.set(i, NumbersFns.getInstance().roundDecimals(res.get(i), digits));
                // }
                for (String field : fields) {
                    for (int i = 0; i < doc_count; i++) {
                        String path = "$.[" + i + "]." + field;
                        String s = JsonPath.read(data, path).toString();
                        if (s.charAt(0) == '[') { // if the result is an array
                            net.minidev.json.JSONArray old_values = JsonPath.parse(data).read(path);
                            JSONArray new_values = new JSONArray(old_values);
                            for (int j = 0; j < new_values.length(); j++) {
                                new_values.put(j, NumbersFns.getInstance().roundDecimals(new_values.getDouble(j), digits));
                            }
                            if ((data = setSingleValues(path, new_values, data)).equals("")) {
                                node.setOutput(nodeError(node, "Can't find asterisk in path"));
                                return false;
                            }
                        } else {
                            data = JsonPath.parse(data).set(path, NumbersFns.getInstance().roundDecimals(Double.valueOf(s), digits)).jsonString();
                        }
                    }
                }
                break;
            case "non_negative":
                // for (int i = 0; i < res.size(); i++) {
                //     res.set(i, NumbersFns.getInstance().isNonNegative(res.get(i)));
                // }
                for (String field : fields) {
                    for (int i = 0; i < doc_count; i++) {
                        String path = "$.[" + i + "]." + field;
                        String s = JsonPath.read(data, path).toString();
                        if (s.charAt(0) == '[') { // if the result is an array
                            net.minidev.json.JSONArray old_values = JsonPath.parse(data).read(path);
                            JSONArray new_values = new JSONArray(old_values);
                            for (int j = 0; j < new_values.length(); j++) {
                                new_values.put(j, NumbersFns.getInstance().isNonNegative(new_values.getDouble(j)));
                            }
                            if ((data = setSingleValues(path, new_values, data)).equals("")) {
                                node.setOutput(nodeError(node, "Can't find asterisk in path"));
                                return false;
                            }
                        } else {
                            data = JsonPath.parse(data).set(path, NumbersFns.getInstance().isNonNegative(Double.valueOf(s))).jsonString();
                        }
                    }
                }
            default: break;
        }

        // for (int i = 0; i < res.size(); i++) {
        //     input_json.put(fields.get(i), res.get(i));
        // }
        JSONObject output_json = new JSONObject().put("data", new JSONArray(data));
        node.setOutput(output_json.toString());
        return true;
    }

    /**
     * @param node
     * @return
     */
    public boolean numberAgg(Flownode node) {
        String data = new JSONObject(node.getInput()).getJSONArray("data").toString();
        Integer doc_count = new JSONArray(data).length();
        JSONObject content = new JSONObject(node.getContent());
        String op = content.getString("operation"); // L'operazione da effettuare
        String new_field = content.getString("new_field"); // la nuova key da creare
        // Boolean per_doc = content.getString("per_doc").equals("true")?true:false; // Process for every doc or globally
        List<String> fields = new ArrayList<>();
        for (Object obj : content.getJSONArray("fields")) {
            fields.add(obj.toString());
        }
        
        // Catch errors for each field: the field is not present in all documents
        for (String field : fields) {
            List<Double> l;
            try {
                l = JsonPath.read(data, "$.[*]."+field);
            } catch (InvalidPathException e) {
                node.setOutput(nodeError(node,  "Invalid field path syntax: '"+field+"'"));
                return false;
            }
            if (l.size() == 0) {
                node.setOutput(nodeError(node, "No document has the field: '" + field + "'"));
                return false;
            }
        }

        switch(op) {
            case "max":
                for (int i = 0; i < doc_count; i++) {
                    List<Double> l = new ArrayList<Double>();
                    for (String field : fields) {
                        String path = "$.[" + i + "]." + field;
                        String s = JsonPath.read(data, path).toString();
                        if (s.charAt(0) == '[') { // if the result is an array
                            net.minidev.json.JSONArray old_values = JsonPath.parse(data).read(path);
                            JSONArray new_values = new JSONArray(old_values);
                            for(int j = 0;j<new_values.length();j++) {
                                l.add(new_values.getDouble(j));
                            }
                            Double new_value = NumbersFns.getInstance().max(l);
                            data = JsonPath.parse(data).put("$.["+i+"]", new_field, new_value).jsonString();
                        } else {
                            data = JsonPath.parse(data).put("$.["+i+"]", new_field, Double.valueOf(s)).jsonString();
                        }
                    }
                }
                break;
            case "min":
                for (int i = 0; i < doc_count; i++) {
                    List<Double> l = new ArrayList<Double>();
                    for (String field : fields) {
                        String path = "$.[" + i + "]." + field;
                        String s = JsonPath.read(data, path).toString();
                        if (s.charAt(0) == '[') { // if the result is an array
                            net.minidev.json.JSONArray old_values = JsonPath.parse(data).read(path);
                            JSONArray new_values = new JSONArray(old_values);
                            for (int j = 0; j < new_values.length(); j++) {
                                l.add(new_values.getDouble(j));
                            }
                            Double new_value = NumbersFns.getInstance().min(l);
                            data = JsonPath.parse(data).put("$.[" + i + "]", new_field, new_value).jsonString();
                        } else {
                            data = JsonPath.parse(data).put("$.[" + i + "]", new_field, Double.valueOf(s)).jsonString();
                        }
                    }
                }
                break;
            case "sum":
                for (int i = 0; i < doc_count; i++) {
                    List<Double> l = new ArrayList<Double>();
                    for (String field : fields) {
                        String path = "$.[" + i + "]." + field;
                        String s = JsonPath.read(data, path).toString();
                        if (s.charAt(0) == '[') { // if the result is an array
                            net.minidev.json.JSONArray old_values = JsonPath.parse(data).read(path);
                            JSONArray new_values = new JSONArray(old_values);
                            for (int j = 0; j < new_values.length(); j++) {
                                l.add(new_values.getDouble(j));
                            }
                            Double new_value = NumbersFns.getInstance().sum(l);
                            data = JsonPath.parse(data).put("$.["+i+"]", new_field, new_value).jsonString();
                        } else {    
                            data = JsonPath.parse(data).put("$.["+i+"]", new_field, Double.valueOf(s)).jsonString();
                        }    
                    }
                }
                break;
            case "avg":
                for (int i = 0; i < doc_count; i++) {
                    List<Double> l = new ArrayList<Double>();
                    for (String field : fields) {
                        String path = "$.[" + i + "]." + field;
                        String s = JsonPath.read(data, path).toString();
                        if (s.charAt(0) == '[') { // if the result is an array
                            net.minidev.json.JSONArray old_values = JsonPath.parse(data).read(path);
                            JSONArray new_values = new JSONArray(old_values);
                            for (int j = 0; j < new_values.length(); j++) {
                                l.add(new_values.getDouble(j));
                            }
                            Double new_value = NumbersFns.getInstance().avg(l);
                            data = JsonPath.parse(data).put("$.[" + i + "]", new_field, new_value).jsonString();
                        } else {
                            data = JsonPath.parse(data).put("$.[" + i + "]", new_field, Double.valueOf(s)).jsonString();
                        }
                    }
                }
                break;
            case "count":
                for (int i = 0; i < doc_count; i++) {
                    List<Double> l = new ArrayList<Double>();
                    for (String field : fields) {
                        String path = "$.[" + i + "]." + field;
                        String s = JsonPath.read(data, path).toString();
                        if (s.charAt(0) == '[') { // if the result is an array
                            net.minidev.json.JSONArray old_values = JsonPath.parse(data).read(path);
                            JSONArray new_values = new JSONArray(old_values);
                            for (int j = 0; j < new_values.length(); j++) {
                                l.add(new_values.getDouble(j));
                            }
                            Integer new_value = NumbersFns.getInstance().count(l);
                            data = JsonPath.parse(data).put("$.[" + i + "]", new_field, new_value).jsonString();
                        } else {
                            data = JsonPath.parse(data).put("$.[" + i + "]", new_field, Double.valueOf(s)).jsonString();
                        }
                    }
                }
                break;
            default: break;
        }

        JSONObject output_json = new JSONObject().put("data", new JSONArray(data));
        node.setOutput(output_json.toString());
        return true;
    }

    public boolean fieldsSelectFunc(Flownode node) {
        String data = new JSONObject(node.getInput()).getJSONArray("data").toString();
        Integer doc_count = new JSONArray(data).length();
        JSONObject content = new JSONObject(node.getContent());
        String op = content.getString("operation"); // L'operazione da effettuare
        List<String> fields = new ArrayList<>();
        for (Object obj : content.getJSONArray("fields")) {
            fields.add(obj.toString());
        }

        // Catch errors: at least one document must have the field
        for (String field : fields) {
            try {
                List<Object> l = JsonPath.read(data, "$.[*]." + field);
                if (l.size() == 0) {
                    node.setOutput(nodeError(node, "No document has the field: '" + field + "'"));
                    return false;
                }
            } catch(InvalidPathException e) {
                node.setOutput(nodeError(node, "Invalid field path syntax: '"+field+"'"));
                return false;
            }
        }
        
        switch (op) {
            case "select":
                String out_arr = "[]";
                JSONArray out_arr_json = new JSONArray(out_arr);
                for (int i = 0; i < doc_count; i++) {
                    JSONObject js_obj = new JSONObject();
                    for (String field : fields) {
                        String path = "$.["+i+"]."+field;
                        String[] x = field.split("[.]");
                        String key = x[x.length-1];
                        if (key.charAt(0) == '[') key = x[x.length-2]; //if is an array
                        js_obj.put(key, (Object)JsonPath.parse(data).read(path));
                        out_arr_json.put(i, js_obj);
                    }
                }
                data = out_arr_json.toString(); 
                break;
            case "deselect":
                for (int i = 0; i < doc_count; i++) {
                    for (String field : fields) {
                        String path = "$.[" + i + "]." + field;
                        data = JsonPath.parse(data).delete(path).jsonString();
                    }
                }
                break;
            default:
                break;
        }

        JSONObject output_json = new JSONObject().put("data", new JSONArray(data));
        node.setOutput(output_json.toString());
        return true;
    }

    public boolean mongoImport(Flownode node) {
        final JSONObject content_json = new JSONObject(node.getContent());
        final String database = content_json.getString("db");
        final String collection = content_json.getString("collection");
        JSONObject output_json = new JSONObject(); // Il json che scriveremo come output
        
        // MongoClient client = MongoClients.create("mongodb://simone:simone@localhost:8090/test");
        MongoClient client = MongoClients.create("mongodb://localhost:8089");
        MongoDatabase db = client.getDatabase(database);
        // Catching empty database (has no collections)
        if (db.listCollectionNames().into(new ArrayList<>()).size() == 0) {
            node.setOutput(nodeError(node, "No collections in database: '"+database+"'"));
            return false;
        }
        MongoCollection col = db.getCollection(collection);
        // Catching empty collection (has no documents)
        if (col.countDocuments() == 0) {
            node.setOutput(nodeError(node, "No documents in collection: '"+collection+"'"));
            return false;
        }
        List<Document> docs = new ArrayList<>();
        col.find().into(docs);
        for (Document document : docs) {
            output_json.append("data", document);
        }
        // col.find().subscribe(new PrintDocumentSubscriber());
        
        // List<Document> databases = mongoClient.listDatabases().into(new ArrayList<>());
        // databases.forEach(db -> System.out.println(db.toJson()));

        node.setOutput(output_json.toString());
        return true;
    }

    public boolean mongoWrite(Flownode node) {
        JSONArray data = new JSONObject(node.getInput()).getJSONArray("data");
        final JSONObject content_json = new JSONObject(node.getContent());
        final String database = content_json.getString("db");
        final String collection = content_json.getString("collection");

        MongoClient client = MongoClients.create("mongodb://localhost:8089");
        MongoDatabase db = client.getDatabase(database);
        // // Catching empty database (has no collections)
        // if (db.listCollectionNames().into(new ArrayList<>()).size() == 0) {
        //     node.setOutput(nodeError(node, "No collections in database: '" + database + "'"));
        //     return false;
        // }
        MongoCollection col = db.getCollection(collection);
        // // Catching empty collection (has no documents)
        // if (col.countDocuments() == 0) {
        //     node.setOutput(nodeError(node, "No documents in collection: '" + collection + "'"));
        //     return false;
        // }
        
        List<Document> docs = new ArrayList<>();
        for (int i = 0; i < data.length(); i++) {
            Document d = new Document(data.getJSONObject(i).toMap());
            docs.add(d);
        }
        col.insertMany(docs);
        return true;
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

    public boolean prometheus(Flownode node) {
        String data = new JSONObject(node.getInput()).getJSONArray("data").toString();
        Integer doc_count = new JSONArray(data).length();
        final JSONObject content_json = new JSONObject(node.getContent());
        // final String field = content_json.getString("field");
        final String metric_type = content_json.getString("metric_type");
        // JSONObject output_json = new JSONObject(); // Il json che scriveremo come output
        List<String> fields = new ArrayList<>();
        for (Object obj : content_json.getJSONArray("fields")) {
            fields.add(obj.toString());
        }

        // Catch errors: at least one document must have the field
        for (String field : fields) {
            try {
                List<Object> l = JsonPath.read(data, "$.[*]." + field);
                if (l.size() == 0) {
                    node.setOutput(nodeError(node, "No document has the field: '" + field + "'"));
                    return false;
                }
            } catch (InvalidPathException e) {
                node.setOutput(nodeError(node, "Invalid field path syntax: '" + field + "'"));
                return false;
            }
        }

        switch (metric_type) {
            case "counter":
                for (int i = 0; i < doc_count; i++) {
                    for (String field : fields) {
                        String path = "$.[" + i + "]." + field;
                        String[] x = field.split("[.]");
                        String key = x[x.length - 1];
                        if (key.charAt(0) == '[') {
                            key = x[x.length - 2]; // if is an array
                        }
                        Prom p = new Prom(field, i);
                    }
                }
                break;
            case "gauge":
                break;
            case "histogram":
                break;
            case "summary":
                break;
            default: break;
        }

        // node.setOutput(output_json.toString());
        System.out.println("okkkkkkkkk1");
        return true;
    }
}
 