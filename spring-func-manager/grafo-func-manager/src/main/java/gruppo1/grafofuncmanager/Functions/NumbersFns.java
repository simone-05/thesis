package gruppo1.grafofuncmanager.Functions;

import java.text.DecimalFormat;
import java.util.List;

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

    public Double max(List<Double> x) {
        if (x.size() == 0) return .0;
        Double max = x.get(0);
        for (int i=1;i<x.size();i++){
            if(x.get(i)>x.get(i-1)) {
                max = x.get(i);
            }
        }
        return max;
    }

    public Double min(List<Double> x) {
        if (x.size() == 0) return .0;
        Double min = x.get(0);
        for (int i=1;i<x.size();i++){
            if(x.get(i)<x.get(i-1)) {
                min = x.get(i);
            }
        }
        return min;
    }

    public Double sum(List<Double> x) {
        if (x.size() == 0) return .0;
        Double sum = x.get(0);
        for (int i=1;i<x.size();i++){
            sum += x.get(i);
        }
        return sum;
    }

    public Double avg(List<Double> x) {
        if (x.size() == 0) return .0;
        Double sum = sum(x);
        return sum/x.size();
    }

    public Integer count(List<Double> x) {
        return x.size();
    }

}
