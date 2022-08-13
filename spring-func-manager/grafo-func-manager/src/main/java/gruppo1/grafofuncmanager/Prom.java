package gruppo1.grafofuncmanager;

import io.prometheus.client.Counter;

public class Prom {
    static Counter counter;

    public Prom(String field, int i) {
        counter = Counter.build()
                .name("doc_" + i + "_" + field)
                .help("Document number " + i + ", field: " + field)
                // .labelNames("nome_label1", "nome_label2")
                .register();
    }
}
