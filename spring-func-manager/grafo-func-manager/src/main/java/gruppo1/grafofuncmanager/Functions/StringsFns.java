package gruppo1.grafofuncmanager.Functions;

/**
 * StringsFunctions
 * Funzioni per operare sulle stringhe di elementi json
 */
public class StringsFns {
    private static StringsFns instance;

    private StringsFns() {

    }

    public static StringsFns getInstance() {
        if (instance == null) return new StringsFns();
        else return instance;
    }

    public String toUpper(String str) {
        return str.toUpperCase();
    }
}
