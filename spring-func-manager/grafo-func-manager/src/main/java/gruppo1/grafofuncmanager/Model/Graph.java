package gruppo1.grafofuncmanager.Model;

import org.springframework.data.annotation.Id;

// @Entity
public class Graph {

    @Id
    private String name;
    private Flownode[] nodes;
    private Edge[] edges;


    public Graph(String name, Flownode[] nodes, Edge[] edges) {
        this.name = name;
        this.nodes = nodes;
        this.edges = edges;
    }


    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Flownode[] getNodes() {
        return this.nodes;
    }

    public void setNodes(Flownode[] nodes) {
        this.nodes = nodes;
    }

    public Edge[] getEdges() {
        return this.edges;
    }

    public void setEdges(Edge[] edges) {
        this.edges = edges;
    }

    public Integer getNodeIndex(Flownode node) {
        for (int i = 0; i < nodes.length; i++) {
            if (node.getId().equals(nodes[i].getId())) {
                return i;
            }
        }
        return -1;
    }
}
