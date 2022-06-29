package gruppo1.grafo.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "graphs") //collection di mongo
public class Graph {
    
    @Id
    private String name;
    
    private String description;
    private String date;
    private Node[] nodes;
    private Edge[] edges;
    private Cluster[] clusters;


    public Graph(String name, String description, String date, Node[] nodes, Edge[] edges, Cluster[] clusters) {
        this.name = name;
        this.description = description;
        this.date = date;
        this.nodes = nodes;
        this.edges = edges;
        this.clusters = clusters;
    }
    
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Node[] getNodes() {
        return this.nodes;
    }

    public void setNodes(Node[] nodes) {
        this.nodes = nodes;
    }


    public Edge[] getEdges() {
        return this.edges;
    }

    public void setEdges(Edge[] edges) {
        this.edges = edges;
    }

    public Cluster[] getClusters() {
        return this.clusters;
    }

    public void setClusters(Cluster[] clusters) {
        this.clusters = clusters;
    }

}
