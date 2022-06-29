import { Node, Edge, GraphEditingService } from '../graph-editing.service';
import { Component, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ClusterNode, DagreClusterLayout } from '@swimlane/ngx-graph';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, OnDestroy {
  nodes: Node[] = [
    // {id: "1", label: 'nodo1', type: "cond"},
    // {id: "2", label: 'nodo2', type: "task"}
  ];
  edges: Edge[] = [
    // {id: "1", label: "arco1", source: "1", target: "2"}
  ];
  clusters: ClusterNode[] = [];
  layout: any;
  graph_id: string = "";
  // layout: any;

  // @Input() update: number = 0;
  update$: Subject<boolean> = new Subject();
  graph_update: Subscription;
  // center$: Subject<boolean> = new Subject();
  // zoomToFit$: Subject<boolean> = new Subject();
  // @Output() selectedNode: any = new EventEmitter<any>();
  // @Output() selectedEdge: any = new EventEmitter<any>();

  Object = Object;
  String = String;

  showNodeDetails: number;
  showEdgeDetails: number;
  showClusterDetails: number;

  constructor(public graphEditingService: GraphEditingService, private activatedRoute: ActivatedRoute) {
    this.showNodeDetails = 0;
    this.showEdgeDetails = 0;
    this.showClusterDetails = 0;
    this.layout = new DagreClusterLayout();

    this.graph_id = this.activatedRoute.snapshot.params['graph_id'];

    this.graphEditingService.loadGraph(this.graph_id);
    this.graph_update = this.graphEditingService.graph$.subscribe(() => {
      this.updateGraph();
    });
    // this.updateGraph();
    // console.log(this.graphEditingService.graph.nodes);
    // this.layout = new DagreClusterLayout();

    // this.graphEditingService.graph$.subscribe((element) => {
    //   if (element) {
    //     this.updateGraph();
    //     // console.log(this.nodes);
    //     // console.log(this.edges);
    //     // console.log(this.clusters);
    //   }
    // });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // switch (this.update) {
    //   case 1:
    //     // this.updateGraph();
    //     break;
    //   case 2:
    //     this.center$.next(true)
    //     break;
    //   case 3:
    //     this.zoomToFit$.next(true)
    //     break;
    //   default:
    //     break;
    // }
  }

  ngOnDestroy(): void {
      this.graph_update.unsubscribe();
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

    this.update$.next(true);
  }

  // onNodeSelect(event: any) {
  //   // this.selectedNode.emit(event);
  // }

  // linkClick(link: any) {
  //   this.selectedEdge.emit(link);
  // }

  // nodeClick(node: any) {
  //   this.selectedNode.emit(node);
  // }

  // clusterClick(cluster: any) {
  //   // this.selectedCluster.emit(cluster);
  // }

  //id è il numero del nodo se il mouse è sopra, 0 se il mouse esce dal nodo
  moreNodeDetails(id: number) {
    this.showNodeDetails = id;
  }

  moreEdgeDetails(id: number) {
    this.showEdgeDetails = id;
  }

  moreClusterDetails(id: number) {
    this.showClusterDetails = id;
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
    nodes.filter((node: any) => node.id == id)[0].processInput();
  }
}
