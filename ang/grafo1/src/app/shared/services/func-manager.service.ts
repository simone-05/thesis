import { Graph, GraphEditingService } from 'src/app/layout/main/graph/graph-editing.service';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http"
import { Observable } from 'rxjs';
import { FlowNode } from '../flow_nodes-interface';
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class FuncManagerService {
  baseUrl = "http://localhost:8080";
  headers = { headers: { "Content-Type": "application/json" } };
  stomp_client: any;
  connected: boolean = false;

  constructor(private http: HttpClient, private gs: GraphEditingService) { }

  updateGraph(graph: Graph): Observable<any> {
    let nodes: any[] = graph.nodes.filter(n => n instanceof FlowNode).map((n: any) => { return {"id": n.id, "content": n.content, "type": n.type, "input": n.input, "output": n.output}
    });
    let edges: any[] = graph.edges.filter(e => (this.gs.getNode(e.source) instanceof FlowNode && this.gs.getNode(e.target) instanceof FlowNode))

    let flowgraph = {
      "name": graph.name,
      "nodes": nodes,
      "edges": edges
    };
    return this.http.post(this.baseUrl+"/graph/update/", flowgraph, this.headers);
  }

  connect() {
    const socket = new SockJS(this.baseUrl+'/stomp-endpoint');
    this.stomp_client = Stomp.Stomp.over(socket);

    const _this = this;
    this.stomp_client.debug = () => {};
    this.stomp_client.connect({}, function (frame: string) {
      _this.connected = true;
      // console.log('Connected: ' + frame);

      _this.stomp_client.subscribe('/topic/debug', function (data: any) {
        data = data.body;
        // console.log(JSON.parse(data).body);
        console.log(data);
      });
    });
  }

  disconnect() {
    if (this.stomp_client != null) {
      this.stomp_client.disconnect();
    }

    this.connected = false;
    // console.log('Disconnected!');
  }

  send(data: any) {
    this.stomp_client.send(
      '/app/injection',
      {},
      JSON.stringify(data)
    );
  }

}
