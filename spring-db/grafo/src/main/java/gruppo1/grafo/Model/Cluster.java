package gruppo1.grafo.Model;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "clusters")
public class Cluster {

    @Id
    private String id;

    private String label;
    private String[] childNodeIds;
    private Map<String, String> data;
    private Map<String, Double> dimension;
    private Map<String, Boolean> meta;
    private Map<String, Double> position;
    private Double width;
    private Double x;
    private Double y;
    


    public Cluster(String id, String label, String[] childNodeIds, Map<String,String> data, Map<String,Double> dimension, Map<String,Boolean> meta, Map<String,Double> position, Double width, Double x, Double y) {
        this.id = id;
        this.label = label;
        this.childNodeIds = childNodeIds;
        this.data = data;
        this.dimension = dimension;
        this.meta = meta;
        this.position = position;
        this.width = width;
        this.x = x;
        this.y = y;
    }


    public String getId() {
        return this.id;
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

    public String[] getChildNodeIds() {
        return this.childNodeIds;
    }

    public void setChildNodeIds(String[] childNodeIds) {
        this.childNodeIds = childNodeIds;
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

    public Double getWidth() {
        return this.width;
    }

    public void setWidth(Double width) {
        this.width = width;
    }

    public Double getX() {
        return this.x;
    }

    public void setX(Double x) {
        this.x = x;
    }

    public Double getY() {
        return this.y;
    }

    public void setY(Double y) {
        this.y = y;
    }
}
