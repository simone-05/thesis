import { BehaviorSubject, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ClusterNode, NgxGraphModule } from '@swimlane/ngx-graph';
import { DatePipe } from '@angular/common';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { SpringDbService } from 'src/app/shared/services/spring-db.service';

@Injectable({
  providedIn: 'root'
})
export class GraphEditingService {
  graph: Graph = {date: "", name: "", description: "", nodes: [], edges: [], clusters: []};
  graph$: BehaviorSubject<Graph|any> = new BehaviorSubject<Graph|any>("graph$ creation");
  loaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  nonflow_types: string[] = ["task", "cond", "clus"];

  constructor(private datePipe: DatePipe, private spring: SpringDbService) { }


  createGraph(graph_name: string, graph_description: string) {
    this.graph.date = this.datePipe.transform(new Date(), "YYYY-MM-dd HH:mm:ss")||"";
    this.graph.name = graph_name;
    this.graph.description = graph_description;
    this.graph.nodes = [];
    this.graph.edges = [];
    this.graph.clusters = [];
    this.graph$.next(this.graph);
  }

  loadGraph(graph_id: string) {
    this.loaded$.next(false);
    this.spring.get(graph_id).subscribe(graph => {
      graph.nodes.forEach((node: any) => {
        const i = graph.nodes.indexOf(node);
        if (node && !this.nonflow_types.includes(node.type)) {
          // switch (node.type) {
          //   case "inject": node = new InjectNode(node.id, node.label, node.properties, node.content/*, this*/); break;//this è l'istanza di graphEditingService
          //   case "debug": node = new DebugNode(node.id, node.label, node.properties); break;
          //   default: break;
          // }
          let n = new FlowNode(node.id, node.label, node.type, node.properties, node.content);
          node = n;
        }
        graph.nodes[i] = node;
      });
      this.graph = graph;
      this.graph$.next(graph);
      this.loaded$.next(true);
    });
  }

  editGraph(graph_name: string, graph_desc: string) {
    this.graph.name = graph_name;
    this.graph.description = graph_desc;
    this.graph$.next(this.graph);
  }

  addNode(node: Node|any) : boolean {
    if (node && !this.graph.nodes.find(nodo => nodo.id == node.id)) {
      this.graph.nodes.push(node);
      this.graph$.next(node);
      return true;
    }
    return false;
  }

  addEdge(edge: Edge) : boolean {
    if (edge && !this.graph.edges.find(arco => arco.id == edge.id)) {
      this.graph.edges.push(edge);
      this.graph$.next(edge);
      return true;
    }
    return false;
  }

  addCluster(cluster: ClusterNode) : boolean {
    if (cluster && !this.graph.clusters.find(clus => clus.id == cluster.id)) {
      this.graph.clusters.push(cluster);
      this.graph$.next(cluster);
      return true;
    }
    return false;
  }

  editNode(node: Node) : boolean{
    let index = this.graph.nodes.indexOf(this.graph.nodes.find(nodo => nodo.id == node.id)||node);
    if (index >= 0) {
      this.graph.nodes[index] = node;
      this.graph$.next(node);
      return true;
    }
    return false;
  }

  editEdge(edge: Edge) : boolean{
    let index = this.graph.edges.indexOf(this.graph.edges.find(arco => arco.id == edge.id)||edge);
    if (index >= 0) {
      this.graph.edges[index] = edge;
      this.graph$.next(edge);
      return true;
    }
    return false;
  }

  editCluster(cluster: ClusterNode) : boolean {
    let index = this.graph.clusters.indexOf(this.graph.clusters.find(clus => clus.id == cluster.id)||cluster);
    if (index >= 0) {
      this.graph.clusters[index] = cluster;
      this.graph$.next(cluster);
      return true;
    }
    return false;
  }

  addToCluster(clusterId: string, node: Node) : boolean {
    let cluster = this.graph.clusters.find(clus=>clus.id==clusterId);
    if (cluster) {
      let index = this.graph.clusters.indexOf(cluster);
      if (index >= 0 && !cluster.childNodeIds?.find(id => id == node.id)) {
          cluster.childNodeIds?.push(node.id);
          this.graph.clusters[index] = cluster;
          this.graph$.next(cluster);
          return true;
      }
    }
    return false;
  }

  deleteNode(id: string) {
    let del_edges: Edge[] = [];
    this.graph.nodes.forEach((node,index) => {
      if (node.id == id) {
        this.graph.nodes.splice(index,1);
        //elimino anche gli archi a lui collegati
        del_edges = this.graph.edges.filter(edge => edge.source == id || edge.target == id);
        //elimino anche le sue entry nei vari cluster
        this.graph.clusters.forEach(cluster => {
          if (cluster.childNodeIds) {
            cluster.childNodeIds.forEach((ids, index) => {
              if (ids == id) cluster.childNodeIds?.splice(index,1);
            });
          }
        });
      }
    });

    del_edges.forEach(element => {
      this.graph.edges.splice(this.graph.edges.indexOf(element),1);
    });

    this.graph$.next(this.graph);
  }

  deleteEdge(id: string) {
    this.graph.edges.forEach((edge,index) => {
      if (edge.id == id) {
        this.graph.edges.splice(index,1);
      }
    })
    this.graph$.next(this.graph);
  }

  deleteCluster(id: string) {
    this.graph.clusters.forEach((clus,index) => {
      if (clus.id == id) {
        this.graph.clusters.splice(index,1);
      }
    })
    this.graph$.next(this.graph);
  }

  saveGraphInStorage() {
    const jsoned_graph = JSON.stringify(this.graph, this.replacer);
    this.spring.create(jsoned_graph).subscribe(x => console.log);
  }

  // Altrimenti non posso fare JSON.stringify per errore di "circular json" (cioè elementi json che fanno riferimento ad altri elementi padri)
  replacer(key: any, value: any) {
    // if (value && value.constructor) {
    //   if (value.constructor.name == " Subject") {
    //     return "[Subject]";
    //   }
    //   if (value.constructor.name == "GraphEditingService") {
    //     return "[GraphEditingService]";
    //   }
    // }
    if (key == "gs") return "[GraphEditingService]";
    if (key == "inputTrigger$") return "[inputTrigger$]";
    return value;
  }

  /*
   * Deletes all nodes and edges, preserving graph name and description
  */
  clearGraph() {
    this.graph.nodes=[];
    this.graph.edges=[];
    this.graph.clusters=[];
    this.graph$.next(this.graph);
  }

  getNode(id: string): Node|FlowNode|undefined {
    return this.graph.nodes.find(nodo => nodo.id == id);
  }

  getFlowNode(id: string): FlowNode {
    return this.graph.nodes.find((nodo) => nodo.id == id) as FlowNode;
  }

  getEdge(id: string): Edge|undefined {
    return this.graph.edges.find(arco => arco.id == id);
  }

  getCluster(id: string): ClusterNode|undefined {
    return this.graph.clusters.find(clus => clus.id == id);
  }

  getConds(node: Node): any[] {
    const conds: any[] = Object.entries(node.properties).map(x => x[1]);
    return conds;
  }

  //Nodi task, inject, ... (non condizione)
  getNodes(): any[] {
    return this.graph.nodes.filter(node => node.type != "cond" && node.type != "clus")||[];
  }

  getFlowNodes(): FlowNode[] {
    return this.graph.nodes.filter(node => node.type != "cond" && node.type != "clus" && node.type != "task") as FlowNode[];
  }

  getOutNodes(id: string) {
    let out_nodes: any[] = [];
    this.graph.edges.forEach((edge) => {
      if (edge.source == id) {
        out_nodes.push(this.getNode(edge.target));
      }
    });
    return out_nodes;
  }
}

export interface Edge {
  id: string,
  label: string,
  source: string,
  target: string,
  weight: number,
  // properties: {
  //   [indice: string]: string,
  // },
}

export interface Node {
  id: string,
  label: string,
  type: string,
  properties: {
    [indice: string]: string,
  },
}

export interface Graph {
  date: string,
  name: string,
  description: string,
  nodes: Node[],
  edges: Edge[],
  clusters: ClusterNode[]
}
