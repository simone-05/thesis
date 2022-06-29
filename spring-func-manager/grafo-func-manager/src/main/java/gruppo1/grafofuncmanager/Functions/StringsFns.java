package gruppo1.grafofuncmanager.Functions;

/**
 * StringsFunctions
 * Funzioni per operare sulle stringhe di elementi json
 */
public class StringsFns {
    private StringsFns instance;

    private StringsFns() {

    }

    public StringsFns getInstance() {
        if (this.instance == null) return new StringsFns();
        else return this.instance;
    }

}
