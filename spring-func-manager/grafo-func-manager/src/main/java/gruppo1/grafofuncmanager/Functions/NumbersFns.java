package gruppo1.grafofuncmanager.Functions;

import java.text.DecimalFormat;

/**
 * NumbersFunctions
 * Funzioni per operare su interi e decimali di elementi json
 */
public class NumbersFns {
    private static NumbersFns instance;

    private NumbersFns() {}

    public static NumbersFns getInstance() {
        if (instance == null) return new NumbersFns();
        else return instance;
    }

    /**
     * Formatting the number x with exactly n decimals
     * @param x the number to operate
     * @param n how many decimals we want
     * @return the resulted number
     */
    public Double trimDecimals(Double x, Integer n) {
        if (n > 0 ) {
            String x_string = String.format("%."+n+"f", x);
            return Double.parseDouble(x_string);

            // double multiplier = Math.pow(10.0, n);
            // int temp = (int) (x * multiplier);
            // double shortenedDouble = ((double) temp) / multiplier;
            // return shortenedDouble;
        } else if (n == 0) {
            int temp = (int) (x*1);
            return (double) temp;
        } else {
            return x;
        }
    }

    /**
     * Rounding the number x to the n-th decimal
     * @param x number to operate
     * @param n how many decimals we want
     * @return the resulted number
     */
    public Double roundDecimals(Double x, Integer n) {
        if (n >= 0) {
            String decimals = "0";
            decimals = decimals.repeat(n);
            DecimalFormat df = new DecimalFormat("0." + decimals);
            String x_string = df.format(x);
            return Double.parseDouble(x_string);
        } else return x;
    }

    public Double isNonNegative(Double x) {
        if (x >= 0) return x;
        return 0.0;
    }

    public Double getInt(Double x) {
        int intero = (int) (x*1);
        double res = intero;
        return res;
    }
}
