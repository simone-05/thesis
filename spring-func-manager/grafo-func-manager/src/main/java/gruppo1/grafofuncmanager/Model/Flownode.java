package gruppo1.grafofuncmanager.Model;

import org.springframework.data.annotation.Id;

public class Flownode {
    @Id
    private String id;
    private String type;
    private String content;
    private String input;
    private String output;


    public Flownode() {
        this.id = this.type = this.content = this.input = this.output = "";
    }

    public Flownode(String id, String type, String content, String input, String output) {
        this.id = id;
        this.type = type;
        this.content = content;
        this.input = input;
        this.output = output;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return this.type;
    }

    public void setType(String type) {
        this.type = type;
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
