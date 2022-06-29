package gruppo1.grafofuncmanager.Functions;

/**
 * NumbersFunctions
 * Funzioni per operare su interi e decimali di elementi json
 */
public class NumbersFns<T> {
    private NumbersFns<T> instance;

    private NumbersFns() {

    }

    public NumbersFns<T> getInstance() {
        if (this.instance == null) return new NumbersFns<T>();
        else return this.instance;
    }
    

    public T trimDecimals(T x, Integer n) {
        //TODO: arrotondamento a max n cifre decimali
        return x;
    }
}
