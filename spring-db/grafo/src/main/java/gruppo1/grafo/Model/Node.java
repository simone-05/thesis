package gruppo1.grafo.Model;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "nodes")
public class Node {

    @Id
    private String id;

    private String label;
    private String type;
    private Property[] properties;
    private String content;
    private String input;
    private String output;
    private Map<String, String> data;
    private Map<String, Double> dimension;
    private Map<String, Boolean> meta;
    private Map<String, Double> position;
    

    public Node(String id, String label, String type, Property[] properties, String content, String input, String output, Map<String,String> data, Map<String,Double> dimension, Map<String,Boolean> meta, Map<String,Double> position) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.properties = properties;
        this.content = content;
        this.input = input;
        this.output = output;
        this.data = data;
        this.dimension = dimension;
        this.meta = meta;
        this.position = position;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }


    public String getLabel() {
        return this.label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getType() {
        return this.type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Property[] getProperties() {
        return this.properties;
    }

    public void setProperties(Property[] properties) {
        this.properties = properties;
    }


    public Map<String,String> getData() {
        return this.data;
    }

    public void setData(Map<String,String> data) {
        this.data = data;
    }

    public Map<String,Double> getDimension() {
        return this.dimension;
    }

    public void setDimension(Map<String,Double> dimension) {
        this.dimension = dimension;
    }

    public Map<String,Boolean> getMeta() {
        return this.meta;
    }

    public void setMeta(Map<String,Boolean> meta) {
        this.meta = meta;
    }

    public Map<String,Double> getPosition() {
        return this.position;
    }

    public void setPosition(Map<String,Double> position) {
        this.position = position;
    }

    public String getContent() {
        return this.content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getInput() {
        return this.input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getOutput() {
        return this.output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

}
