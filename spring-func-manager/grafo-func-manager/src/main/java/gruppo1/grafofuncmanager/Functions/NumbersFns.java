package gruppo1.grafofuncmanager.Functions;

/**
 * NumbersFunctions
 * Funzioni per operare su interi e decimali di elementi json
 */
public class NumbersFns {
    private static NumbersFns instance;

    private NumbersFns() {

    }

    public static NumbersFns getInstance() {
        if (instance == null) return new NumbersFns();
        else return instance;
    }
    

    public Double trimDecimals(Double x, Integer n) {
        //TODO: arrotondamento a max n cifre decimali
        return x;
    }
}
