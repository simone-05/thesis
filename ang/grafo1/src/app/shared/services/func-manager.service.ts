import { Graph, GraphEditingService } from 'src/app/layout/main/graph/graph-editing.service';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http"
import { Observable } from 'rxjs';
import { FlowNode } from '../flow_nodes-interface';
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';


@Injectable({
  providedIn: 'root'
})
export class FuncManagerService {
  baseUrl = "http://localhost:8080";
  headers = { headers: { "Content-Type": "application/json" } };
  stomp_client: any;
  connected: boolean = false;
  client: Stomp.Client;

  constructor(private http: HttpClient, private gs: GraphEditingService) {
    this.client = new Stomp.Client();
  }

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
    // const socket = new SockJS(this.baseUrl+'/stomp-endpoint');
    // this.stomp_client = Stomp.Stomp.over(socket);

    // const _this = this;
    // // nasconde il log sullo status del mittende e destinatario
    // this.stomp_client.debug = () => {};
    // this.stomp_client.connect({}, function (frame: string) {
    //   _this.connected = true;
    //   // console.log('Connected: ' + frame);

    //   _this.stomp_client.subscribe('/topic/debug', function (data: any) {
    //     data = data.body;
    //     // console.log(JSON.parse(data).body);
    //     console.log(data);
    //   });
    // });

    this.client.brokerURL = 'ws://localhost:8080/stomp-endpoint';
    this.client.debug = () => { };
    this.client.reconnectDelay = 2000;
    this.client.onConnect = () => {
      this.updateGraph(this.gs.graph).subscribe();
      const subscription = this.client.subscribe('/topic/debug', (data: any) => {
          data = data.body;
          console.log(JSON.parse(data));
          // console.log(data);
      });
    }
    this.client.onStompError = () => {
      console.log("Errore stomp client");
    }

    this.client.activate();
  }

  disconnect() {
    // if (this.stomp_client != null) {
    //   this.stomp_client.disconnect();
    // }

    // this.connected = false;
    // // console.log('Disconnected!');

    this.client.deactivate();
  }

  send(data: any) {
    // this.stomp_client.send(
    //   '/app/injection',
    //   {},
    //   JSON.stringify(data)
    // );

    try {
      this.client.publish({destination: "/app/injection", body: JSON.stringify(data)});
    } catch (error) {
      console.log("ERROR in sending message, maybe wait for reconnection");
    }
  }

}
