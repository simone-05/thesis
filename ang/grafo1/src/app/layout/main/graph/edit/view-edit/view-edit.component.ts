import { GraphEditingService, Node, Edge } from '../../graph-editing.service';
import { Component, OnInit, SimpleChanges, OnChanges, Input, EventEmitter, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import * as _ from 'lodash';
import { ClusterNode, DagreClusterLayout } from '@swimlane/ngx-graph';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { FuncManagerService } from 'src/app/shared/services/func-manager.service';

@Component({
  selector: 'app-view-edit',
  templateUrl: './view-edit.component.html',
  styleUrls: ['./view-edit.component.scss']
})
export class ViewEditComponent implements OnDestroy {
  nodes: Node[] = [
    // {id: "1", label: 'nodo1', type: "cond"},
    // {id: "2", label: 'nodo2', type: "task"}
  ];
  edges: Edge[] = [
    // {id: "1", label: "arco1", source: "1", target: "2"}
  ];
  clusters: ClusterNode[] = [];
  layout: any;

  @Input() update: number = 0;
  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();
  zoomToFit$: Subject<boolean> = new Subject();
  @Output() selectedNode: any = new EventEmitter<any>();
  @Output() selectedEdge: any = new EventEmitter<any>();
  graph_subscription: Subscription;

  Object = Object;
  String = String;
  document = document;

  nodeDetails: string;
  edgeDetails: string;
  clusterDetails: string;
  moreNodeDetails: {'id': string,'type': string, 'data': any};

  constructor(public graphEditingService: GraphEditingService, private fm: FuncManagerService) {
    this.nodeDetails = "-1";
    this.edgeDetails = "0";
    this.clusterDetails = "0";
    this.moreNodeDetails = {id: '-1', type: '', data: null};
    this.layout = new DagreClusterLayout();

    this.graph_subscription = this.graphEditingService.graph$.subscribe((element) => {
      if (element) {
        this.updateGraph();
      }
    });
  }

  ngOnDestroy() {
    this.graph_subscription.unsubscribe();
  }

  getContentHeight(): string {
    const header_height: number | undefined = document.getElementsByTagName("app-header")[0].firstElementChild?.clientHeight || 67;
    const viewport_height: number | undefined = window.innerHeight || 290;
    return (viewport_height - header_height).toString() + "px";
  }

  updateGraph() {
    // this.clusters = [...this.graphEditingService.graph.clusters];
    // this.nodes = [...this.graphEditingService.graph.nodes];
    // this.edges = [...this.graphEditingService.graph.edges];
    this.nodes = this.graphEditingService.graph.nodes;
    this.edges = this.graphEditingService.graph.edges;
    this.clusters = this.graphEditingService.graph.clusters;
    // this.nodes = this.graphEditingService.graph$.getValue().nodes;
    // this.edges = this.graphEditingService.graph$.getValue().edges;

    this.update$.next(true);
  }

  onNodeSelect(event: any) {
    // this.selectedNode.emit(event);
  }

  linkClick(link: any) {
    this.selectedEdge.emit(link);
  }

  nodeClick(node: any) {
    this.selectedNode.emit(node);
  }

  clusterClick(cluster: any) {
    // this.selectedCluster.emit(cluster);
  }

  //id è il numero del nodo se il mouse è sopra, 0 se il mouse esce dal nodo
  setNodeDetails(id: string) {
    this.nodeDetails = id;
  }

  setEdgeDetails(id: string) {
    this.edgeDetails = id;
  }

  setClusterDetails(id: string) {
    this.clusterDetails = id;
  }

  checkClusterConditions(cluster: ClusterNode, task_node: Node): boolean {
    let inner_nodes: any[] = [];  //nodi dentro il cluster

    //prendo i nodi interni al cluster
    if (cluster.childNodeIds) {
      inner_nodes = cluster.childNodeIds.filter(id => id.split("_")[0] == "c").map(id => this.graphEditingService.getNode(id));
    }

    // console.log(inner_nodes);

    let flag = false;
    inner_nodes.forEach((node: Node) => {
      if (this.checkAllProps(node, task_node)) {
        flag = true;
        return;
      }
    });

    return flag;
  }

  checkConditions(edge: Edge): number { //ritorna: 0 arco grigio, 1 arco rosso, 2 arco verde
    //salvo nodo sorgente
    const source_node: Node | undefined = this.nodes.find(nodo => nodo.id == edge.source);
    //salvo nodo destinazione
    const target_node: Node | undefined = this.nodes.find(nodo => nodo.id == edge.target);

    if (target_node && target_node.type == "task") {
      if (source_node && source_node.type == "clus") {
        let clus = this.clusters.find(clus => clus.id == "clus_" + source_node.id.split("_")[1]);
        if (clus && this.checkClusterConditions(clus, target_node)) {
          return 2;
        } else return 1;
      }
    }

    if (target_node && target_node.type == "clus") {
      if (source_node && source_node.type == "cond") {
        let task_node = this.nodes.find(node => node.id == source_node.id.split("_")[1].split("-")[1]);
        // console.log(task_node);
        if (task_node && this.checkAllProps(source_node, task_node)) {
          return 2;
        } else return 1;
      }
    }

    return 0;
  }

  //true se tutte le condizioni del PRIMO nodo parametro sono presenti e stesso valore nel SECONDO nodo parametro
  checkAllProps(node1: Node, node2: Node): boolean {
    const cond_1 = Object.entries(node1.properties).map(x => x[1]);
    const cond_2 = Object.entries(node2.properties).map(x => x[1]);

    let flag: boolean = true;

    cond_1.forEach((element: any) => {
      if (element.value == "" || element.value == null) {
        if (!cond_2.find((x: any) => x.name == element.name)) {
          flag = false;
          return
        }
      } else {
        const x = cond_2.find((x: any) => x.name == element.name && x.value == element.value);
        if (!x) {
          flag = false;
          return;
        }
      }
    });

    return flag;
  }

  //funzione necessaria, perchè dall'html il nodo non viene visto come oggetto di tipo InjectNode
  injection(nodes: any, id: any) {
    const node: FlowNode = nodes.filter((node:any) => node.id == id)[0];
    // node.processInput();
    const n = {"id": node.id, "content": node.content, "type": node.type};
    this.fm.send(n);
  }

  /**
   * Funzione chiamata dall attr.fill nel template del nodo corrispondente, per colorarsi
   * @param id id del nodo
   * @param part 'body'|'header' parte del nodo (il rect element)
   * @returns il colore come variabile es: 'var(--flow-node-body-default)'
   */
  fillFunction(id: string, part: "body"|"header"): string {
    const node: FlowNode = this.graphEditingService.getNode(id) as FlowNode;
    const status: string = node.color||"default";
    return "var(--flow-node-"+part+"-"+ status +")";
  }

  setMoreNodeDetails(id: string, type: "input"|"output"|"content"|'') {
    const node: FlowNode = this.graphEditingService.getFlowNode(id);
    let data = null;
    if (id != "-1" && type) {
      data = node[type];
      if (data) { //se il nodo ha il campo input|output|content
        data = JSON.parse(data);
        data = JSON.stringify(data, null, 4);
      }
    }
    this.moreNodeDetails = {id, type, data};
  }

  popoverContent(): string {
    let popover_element = document.getElementsByTagName("ngb-popover-window").item(0)?.getElementsByClassName("popover-body").item(0);
    if (!popover_element?.children.namedItem("my_popover_element")) {
      let my_popover_html = document.createElement("pre");
      my_popover_html.setAttribute("id", "my_popover_element");
      my_popover_html.innerText = this.moreNodeDetails.data||'null';
      popover_element?.appendChild(my_popover_html);
    }
    return " "; // Mostra sempre il popover, anche senza contenuto

    /* Per non mostrare il popover se non ha contenuto
    if (this.moreNodeDetails.data) return " ";
    else return ""; */
  }

  /*  Se voglio usare un tooltip anzichè popover
  tooltipContent() {
    let tooltip_element = document.getElementsByTagName("ngb-tooltip-window").item(0)?.getElementsByClassName("tooltip-inner").item(0);
    if (!tooltip_element?.children.namedItem("my_tooltip_element")) {
      let my_tooltip_element = document.createElement("pre");
      my_tooltip_element.setAttribute("id", "my_tooltip_element");
      my_tooltip_element.innerText = this.moreNodeDetails.data;
      tooltip_element?.appendChild(my_tooltip_element);
    }
    if (this.moreNodeDetails.data) return " ";
    else return "";
  } */
}
