import { SpringService } from './../../../../../shared/services/spring.service';
import { GraphEditingService, Node, Edge, Graph } from '../../graph-editing.service';
import { Router } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { ClusterNode } from '@swimlane/ngx-graph';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar-edit',
  templateUrl: './sidebar-edit.component.html',
  styleUrls: ['./sidebar-edit.component.scss']
})
export class SidebarEditComponent implements OnInit, OnChanges, OnDestroy {
  view: string;

  editGraphForm: FormGroup;
  nodeForm: FormGroup;
  edgeForm: FormGroup;
  nodePropForm: FormGroup;
  clusterForm: FormGroup;
  condForm: FormGroup;
  // edgePropForm: FormGroup;

  nodePropId: number;
  edgePropId: number;
  isCollapsed: boolean;
  @Output() updateGraphView = new EventEmitter<number>();
  @Input() selectedNode?: Node;
  @Input() selectedEdge?: Edge;
  @Input() selectedCluster?: ClusterNode;
  @Input() forcedChange: any;
  nodeSelected$: BehaviorSubject<Node | any> = new BehaviorSubject<Node | any>(null);
  graph_subscription: Subscription;

  graphNameAlready: boolean = false;
  graphSearching: boolean = false;
  nodeEditing: boolean = false;
  edgeEditing: boolean = false;
  clusterEditing: boolean = false;

  Object = Object;

  constructor(public graphEditingService: GraphEditingService, private formBuilder: FormBuilder, private router: Router, private sp: SpringService) {
    this.view = "node_debug";
    this.isCollapsed = true;
    this.nodePropId = 0;
    this.edgePropId = 0;

    this.editGraphForm = this.formBuilder.group({
      graph_name: ["", Validators.required],
      graph_desc: ["", Validators.required]
    });

    this.nodeForm = this.formBuilder.group({
      node_id: [null, [Validators.required, this.checkNodeId()]],
      node_label: null,
      node_type: null,
      node_data: this.formBuilder.array([]),
    });
    // this.nodeForm.valueChanges.subscribe(()=>console.log(this.nodeForm.controls["node_data"]));

    this.nodePropForm = this.formBuilder.group({
      node_prop_name: [null, [Validators.required, this.checkNodeProperty()]],
      node_prop_value: null,
    });

    this.condForm = this.formBuilder.group({
      cond_id: null,
      cond_source: null,
      cond_target: [null, [Validators.required, this.checkCondNodeTask()]],
      cond_label: null,
      cond_cluster: null,
      cond_data: this.formBuilder.array([], this.checkCondPresent()),
    }, { validators: this.checkCondForm() });

    this.edgeForm = this.formBuilder.group({
      edge_id: null,
      edge_label: null,
      edge_source: [null, [Validators.required, this.checkEdgeNode()]],
      edge_target: [null, [Validators.required, this.checkEdgeNode()]],
      // edge_data: this.formBuilder.array([]),
      edge_weight: [1, this.checkEdgeWeight()],
    }, { validators: this.checkEdgeId() });

    this.graph_subscription = this.graphEditingService.graph$.subscribe(() => {
      this.editGraphForm.get("graph_name")?.setValue(this.graph.name);
      this.editGraphForm.get("graph_desc")?.setValue(this.graph.description);
    });

    // this.edgePropForm = this.formBuilder.group({
    //   edge_prop_name: [null, [Validators.required, this.checkEdgeProperty()]],
    //   edge_prop_value: [null, Validators.required],
    // });

    this.clusterForm = this.formBuilder.group({
      cluster_id: [null, [Validators.required, this.checkClusterId()]],
      cluster_label: null,
      cluster_nodes: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.forcedChange == 1) {
      this.selectedNodeInputChange(this.selectedNode);
      this.nodeSelected$.next(this.selectedNode);
    }

    if (this.forcedChange == 2) {
      this.selectedEdgeInputChange(this.selectedEdge);
    }

    // if (this.forcedChange == 3) {
    //   this.selectedClusterInputChange(this.selectedCluster);
    // }
  }

  ngOnDestroy(): void {
      this.graph_subscription.unsubscribe();
  }

  /**
   * Calculates the max height of the sidebar (this component)
   * @returns height in string (with 'px' to the end)
   */
  getSidebarHeight(): string {
    const header_height: number | undefined = document.getElementsByTagName("app-header")[0].firstElementChild?.clientHeight || 67;
    const viewport_height: number | undefined = window.innerHeight || 290;
    return (viewport_height - header_height).toString() + "px";
  }

  /**
   * Calculates the max height of the forms in the sidebar (the total sidebar height minus the bottom buttons (save graph, center, ...))
   * @returns height in string (with 'px' at the end)
   */
  getSidebarFormHeight(): string {
    const bottom_sidebar_height: number | undefined = document.getElementById("BottomSidebarForm")?.clientHeight;
    if (bottom_sidebar_height == undefined) {
      return "auto";
    } else {
      // console.log(Number(this.getSidebarFormHeight().split("p")[0]));
      return (Number(this.getSidebarHeight().split("p")[0]) - bottom_sidebar_height).toString() + "px";
    }
  }

  get graph(): Graph {
    return this.graphEditingService.graph;
  }

  get nodeDataForm(): FormArray {
    return this.nodeForm.get("node_data") as FormArray;
  }

  get condDataForm(): FormArray {
    return this.condForm.get("cond_data") as FormArray;
  }

  get clusterNodes(): FormArray {
    return this.clusterForm.get("cluster_nodes") as FormArray;
  }

  // get edgeDataForm() : FormArray {
  //   return this.edgeForm.get("edge_data") as FormArray;
  // }

  editGraph() {
    let new_name = this.editGraphForm.controls["graph_name"].value;
    let old_name = this.graph.name;
    if (this.editGraphForm.controls["graph_name"].valid) {
      if (old_name != new_name) {
        this.sp.checkGraphExists(new_name).subscribe(found => {
          if (!found) {
            this.graphNameAlready = false;
            this.sp.delete(old_name).subscribe(x => console.log);

            this.graph.name = this.editGraphForm.controls['graph_name'].value;
          }
        })
      }
      this.graph.description = this.editGraphForm.controls['graph_desc'].value;
    }
  }

  checkGraphName() {
    this.graphSearching = true;
    let new_name = this.editGraphForm.controls["graph_name"].value;
    let old_name = this.graphEditingService.graph.name;
    if (new_name != old_name && new_name != "") {
      this.sp.checkGraphExists(new_name).subscribe((found) => {
        this.graphNameAlready = found;
        this.graphSearching = false;
      })
    }
  }

  tryNode() {
    let node_id = this.nodeForm.controls["node_id"].value;
    let node_label = this.nodeForm.controls["node_label"].value || "";
    this.nodeForm.controls['node_type'].setValue(this.view == "node_cond" ? "cond" : "task");
    let node_type = this.nodeForm.controls["node_type"].value;
    let node_data = this.nodeForm.controls["node_data"].value;
    // let node_cluster = this.nodeForm.controls["node_cluster"].value;
    // if (node_cluster) {
    //   let clus = this.graphEditingService.getCluster(node_cluster);
    //   clus?.childNodeIds?.push(node_id);
    // }
    let node: Node = { id: node_id, label: node_label, type: node_type, properties: node_data };
    if (this.nodeEditing) {
      this.graphEditingService.editNode(node);
    } else {
      this.graphEditingService.addNode(node);
    }
    this.clearNodeInput();
  }

  tryCond() {
    let cond_source = this.condForm.controls["cond_source"].value || "";
    let cond_target = this.condForm.controls["cond_target"].value;
    let cond_label = this.condForm.controls["cond_label"].value || "";
    let cond_data = this.condForm.controls["cond_data"].value;
    this.condForm.controls["cond_cluster"].setValue("clus_" + cond_source + "-" + cond_target);
    let cond_cluster = this.condForm.controls["cond_cluster"].value;
    let cluster_already = this.graph.clusters.find(clus => clus.id == cond_cluster);

    if (!cluster_already) {
      let cluster: ClusterNode = { id: "clus_" + cond_source + "-" + cond_target, label: "", childNodeIds: [] };
      this.graphEditingService.addCluster(cluster);
      const empty_props: any[string] = [];
      if (cond_source != "") {
        let in_node: Node = { id: "cin_" + cond_source + "-" + cond_target, label: "", type: "clus", properties: empty_props };
        this.graphEditingService.addNode(in_node);
        let in_edge: Edge = { id: "_" + cond_source + "-" + in_node.id, source: cond_source, target: in_node.id, label: "", weight: 1 };
        this.graphEditingService.addEdge(in_edge);
        this.graphEditingService.addToCluster(cluster.id, in_node);
        //rimuovo l'arco tra i due nodi task precedentemente creato
        this.graphEditingService.deleteEdge("_" + cond_source + "-" + cond_target);
      }
      let out_node: Node = { id: "cout_" + cond_source + "-" + cond_target, label: "", type: "clus", properties: empty_props };
      this.graphEditingService.addNode(out_node);
      let out_edge: Edge = { id: "_" + out_node.id + "-" + cond_target, source: out_node.id, target: cond_target, label: "", weight: 1 };
      this.graphEditingService.addEdge(out_edge);
      this.graphEditingService.addToCluster(cluster.id, out_node);
      // this.graphEditingService.deleteEdge("_"+cond_source+"-"+cond_target);
    }

    // Imposto l'id del nodo condizione, la cui ultima parte e un numero variabile:
    // Cerco tra i nodi condizione, quelli che stanno tra gli stessi nodi task, e ne estraggo l'utlima parte, il numero che mi serve (se non c'erano gia nodi condizione presenti allora lo imposto a zero)
    if (!this.nodeEditing) {
      let last_number: number = Number(this.graph.nodes.filter(node => node.id.split("_")[0] == "c" && node.id.split("_")[1] == cond_source + "-" + cond_target).pop()?.id.split("_")[2] || "0");
      // lo incremento
      last_number += 1;
      // costruisco l'id del nuovo nodo condizione
      this.condForm.controls["cond_id"].setValue("c_" + cond_source + "-" + cond_target + "_" + String(last_number));
    }
    let cond_id = this.condForm.controls["cond_id"].value;

    if (cond_source != "") {
      let in_node_id = this.graphEditingService.getCluster(cond_cluster)?.childNodeIds?.find(id => id.split("_")[0] == "cin") || "";
      let edge_in_to_cond: Edge = { id: "_" + in_node_id + "-" + cond_id, label: "", weight: 1, source: in_node_id, target: cond_id };
      this.graphEditingService.addEdge(edge_in_to_cond);
    }
    let out_node_id = this.graphEditingService.getCluster(cond_cluster)?.childNodeIds?.find(id => id.split("_")[0] == "cout") || "";
    let edge_cond_to_out: Edge = { id: "_" + cond_id + "-" + out_node_id, label: "", weight: 1, source: cond_id, target: out_node_id };
    this.graphEditingService.addEdge(edge_cond_to_out);


    let node: Node = { id: cond_id, label: cond_label, type: "cond", properties: cond_data };
    if (this.nodeEditing) {
      this.graphEditingService.editNode(node);
    } else {
      this.graphEditingService.addNode(node);
      this.graphEditingService.addToCluster(cond_cluster, node);
    }
    this.clearCondInput();
  }

  tryEdge() {
    let edge_label = this.edgeForm.controls["edge_label"].value || "";
    let edge_source = this.edgeForm.controls["edge_source"].value;
    let edge_target = this.edgeForm.controls["edge_target"].value;
    this.edgeForm.controls["edge_id"].setValue("_" + edge_source + "-" + edge_target);
    let edge_id = this.edgeForm.controls["edge_id"].value;
    // let edge_data = this.edgeForm.controls['edge_data'].value;
    let edge_weight = this.edgeForm.controls["edge_weight"].value || 1;
    let edge: Edge = { id: edge_id, source: edge_source, target: edge_target, label: edge_label, weight: edge_weight };
    if (this.edgeEditing) {
      this.graphEditingService.editEdge(edge);
    } else {
      this.graphEditingService.addEdge(edge);
    }
    // this.passContent(edge_source, edge_target);
    this.clearEdgeInput();
  }

  tryCluster() {
    let cluster_id = this.clusterForm.controls["cluster_id"].value;
    let cluster_label = this.clusterForm.controls["cluster_label"].value || "";
    let cluster_nodes = this.clusterForm.controls["cluster_nodes"].value || [];
    let cluster: ClusterNode = { id: cluster_id, label: cluster_label, childNodeIds: cluster_nodes };
    if (this.clusterEditing) {
      this.graphEditingService.editCluster(cluster);
    } else {
      this.graphEditingService.addCluster(cluster);
    }
    this.clearClusterInput();
  }

  deleteNode() {
    let node_id = this.nodeForm.controls["node_id"].value;
    this.graphEditingService.deleteNode(node_id);
    this.clearNodeInput();
  }

  deleteEdge() {
    let edge_id = this.edgeForm.controls["edge_id"].value;
    this.graphEditingService.deleteEdge(edge_id);
    this.clearEdgeInput();
  }

  deleteCond() {
    let cond_id = this.condForm.controls["cond_id"].value;
    this.graphEditingService.deleteNode(cond_id);
    //cancello il cluster e i suoi edge, se e l'ultimo nodo condizione al suo interno:
    let tasks = cond_id.split("_")[1];
    let cluster_id = "clus_" + tasks;
    if (!this.graph.clusters.find(clus => clus.id == cluster_id)?.childNodeIds?.find(id => id.split("_")[0] == "c")) {
      //se ultimo nodo condizione del grafo
      this.graphEditingService.deleteCluster(cluster_id);
      this.graphEditingService.deleteNode("cin_" + tasks);
      this.graphEditingService.deleteNode("cout_" + tasks);
      if (tasks.split("-")[0]) {
        this.graphEditingService.addEdge({ id: "_" + tasks, label: "", source: tasks.split("-")[0], target: tasks.split("-")[1], weight: 1 });
      }
    }
    this.clearCondInput();
  }

  deleteCluster() {
    let cluster_id = this.clusterForm.controls["cluster_id"].value;
    this.graphEditingService.deleteCluster(cluster_id);
    this.clearClusterInput();
  }

  clearNodeInput() {
    this.nodeEditing = false;
    this.nodePropId = 0;
    this.nodeForm.reset();
    this.nodeForm.controls["node_data"] = this.formBuilder.array([]);
    // this.nodeDataForm.updateValueAndValidity();
  }

  clearCondInput() {
    this.nodeEditing = false;
    this.nodePropId = 0;
    this.condForm.reset();
    this.condForm.controls["cond_data"] = this.formBuilder.array([], this.checkCondPresent());
  }

  clearEdgeInput() {
    this.edgeEditing = false;
    this.edgePropId = 0;
    this.edgeForm.reset();
    // this.edgeForm.controls["edge_data"] = this.formBuilder.array([]);
    this.edgeForm.controls["edge_weight"].setValue(1);
  }

  clearClusterInput() {
    this.clusterEditing = false;
    this.clusterForm.reset();
    this.clusterForm.controls["cluster_nodes"] = this.formBuilder.array([]);
    // this.nodeDataForm.updateValueAndValidity();
  }

  clearPropsInput() {
    this.nodePropForm.reset();
  }

  selectedNodeInputChange(node: any) {
    if (node.type == "clus") return;
    if (node.type != "cond" && node.type != "task") {
      this.view = "node_" + node.type;
      return;
    }
    this.clearNodeInput();
    this.clearCondInput();
    this.nodeEditing = true;
    if (node.type == "task") {
      this.nodeForm.controls["node_id"].setValue(node.id);
      this.nodeForm.controls["node_label"].setValue(node.label);
      this.graph.clusters.forEach(clus => {
        clus.childNodeIds?.forEach(ids => {
          if (ids == node.id) {
            this.nodeForm.controls["node_cluster"].setValue(clus.id);
            return;
          }
        });
      });

      node.properties.forEach((element: any) => {
        const dato = this.formBuilder.group({
          id: element.id,
          name: [element.name, [Validators.required, this.checkNodeProperty()]],
          value: [element.value, Validators.required],
        });
        this.nodeDataForm.push(dato);
      });
      this.view = "node_task";
    } else if (node.type == "cond") {
      this.condForm.controls["cond_id"].setValue(node.id);
      this.condForm.controls["cond_label"].setValue(node.label);
      this.condForm.controls["cond_source"].setValue(node.id.split("_")[1].split("-")[0]);
      this.condForm.controls["cond_target"].setValue(node.id.split("_")[1].split("-")[1]);

      node.properties.forEach((element: any) => {
        const dato = this.formBuilder.group({
          id: element.id,
          name: [element.name, [Validators.required, this.checkNodeProperty()]],
          value: element.value,
        });
        this.condDataForm.push(dato);
      });
      this.view = "node_cond";
    }
  }

  selectedEdgeInputChange(edge: any) {
    this.clearEdgeInput();
    this.edgeEditing = true;
    this.edgeForm.controls["edge_id"].setValue(edge.id);
    this.edgeForm.controls["edge_label"].setValue(edge.label);
    this.edgeForm.controls["edge_source"].setValue(edge.source);
    this.edgeForm.controls["edge_target"].setValue(edge.target);
    this.edgeForm.controls["edge_weight"].setValue(edge.weight);
    // edge.properties.forEach((element: any) => {
    //   const dato = this.formBuilder.group({
    //     id: element.id,
    //     name: element.name,
    //     value: element.value,
    //   });
    //   this.edgeDataForm.push(dato);
    // });
    this.view = "edge";
    // this.passContent(edge.source, edge.target);
  }

  selectedClusterInputChange(cluster: any) {
    this.clearClusterInput();
    this.clusterEditing = true;
    this.clusterForm.controls["cluster_id"].setValue(cluster.id);
    this.clusterForm.controls["cluster_label"].setValue(cluster.label);
    if (cluster.childNodeIds) {
      cluster.childNodeIds.forEach((id: string) => {
        const dato = this.formBuilder.control(id);
        this.clusterNodes.push(dato);
      });
    }
    this.view = "cluster";
  }

  saveGraph() {
    this.graphEditingService.saveGraphInStorage();
    this.router.navigate(["/app/graph/list"]);
  }

  start_over() {
    this.graphEditingService.clearGraph();
    this.clearNodeInput();
    this.clearCondInput();
    this.clearEdgeInput();
    // this.clearClusterInput();
  }

  changedView(insertChoice: string) {
    this.view = insertChoice;
    // Necessario per resettare i form dei components dei flownodes:
    if (RegExp("node_*").test(this.view)) {
      this.nodeSelected$.next(null);
    }
    switch (this.view) {
      case "node_task": this.clearNodeInput(); break;
      case "node_cond": this.clearCondInput(); break;
      case "edge": this.clearEdgeInput(); break;
      default: break;
    }
    this.clearPropsInput();
  }

  reload_page() {
    location.reload();
  }

  centerGraph() {
    this.updateGraphView.emit(2);
  }

  fitGraph() {
    this.updateGraphView.emit(3);
  }

  addNodeDataField() {
    this.nodePropId += 1;
    const dato = this.formBuilder.group({
      id: String(this.nodePropId),
      name: [null, [Validators.required, this.checkNodeProperty()]],
      value: [null, Validators.required],
    });
    this.nodeDataForm.push(dato);
    // this.nodePropForm.reset();
  }

  addCondDataField() {
    this.nodePropId += 1;
    const dato = this.formBuilder.group({
      id: String(this.nodePropId),
      name: [null, [Validators.required, this.checkNodeProperty()]],
      value: null,
    });
    this.condDataForm.push(dato);
    this.nodePropForm.reset();
  }

  editNodeDataField(name: string) {

  }

  // addEdgeDataField() {
  //   this.edgePropId += 1;
  //   const dato = this.formBuilder.group({
  //     id: this.edgePropId,
  //     name: this.edgePropForm.controls["edge_prop_name"].value,
  //     value: this.edgePropForm.controls["edge_prop_value"].value,
  //   });
  //   this.edgeDataForm.push(dato);
  //   this.edgePropForm.reset();
  // }

  removeNodeDataField(n: number) {
    this.nodeDataForm.removeAt(n);
  }

  removeCondDataField(n: number) {
    this.condDataForm.removeAt(n);
  }

  // removeEdgeDataField(n: number) {
  //   this.edgeDataForm.removeAt(n);
  // }

  checkNodeId(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        if (!this.nodeEditing) {
          if (/[_-\s]/g.test(control.value)) {
            return { illegalCharacters: true, msg: "Can't contain any _ - or whitespaces" }
          }
          if (this.graph.nodes.filter(node => node.type != "cond" && node.type != "clus").find(nodo => nodo.id == control.value)) {
            return { already: true, msg: "Already exists a node with this id" };
          }
        }
      }
      return null;
    }
  }

  checkNodeProperty(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        if (this.view == "node_task") {
          if (this.nodeForm.controls["node_data"].value.find((props: any) => props.name == control.value) && control.dirty) {
            return { already: true, msg: "Already existst a property with this name" };
          }

          // non posso aggiungere una condizione se non e presente nei nodi task destinatari
          // if (this.view == "node_cond" && this.graph.edges.find((edge: Edge) => edge.source == this.condForm.controls["cond_id"].value)) {
        } else if (this.view == "node_cond") {
          if (this.condForm.controls["cond_data"].value.find((props: any) => props.name == control.value) && control.dirty) {
            return { already: true, msg: "Already existst a property with this name" };
          }

          let flag: boolean = false;
          let task_node = this.graphEditingService.getNode(this.condForm.controls["cond_target"].value);
          let task_conds: any[] = [];
          if (task_node) {
            task_conds = this.graphEditingService.getConds(task_node);
          }

          task_conds.forEach(element => {
            if (element.name == control.value) {
              flag = true;
              return;
            }
          });

          if (flag) return null;
          else return { noCondName: true, msg: "This condition isn't present in any of the targeting task nodes" };
        }
      }
      return null;
    }
  }

  checkEdgeId(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        let source = control.value.edge_source;
        let target = control.value.edge_target;
        if (source && target) {
          if (source == target) {
            return { loop: true, msg: "Source and target must be different" };
          } else if (
            (this.graph.nodes.find(nodo => nodo.id == target && nodo.type == "cond") ||
              this.graph.clusters.find(clus => clus.id == target))
            &&
            (this.graph.nodes.find(nodo => nodo.id == source && nodo.type == "cond") ||
              this.graph.clusters.find(clus => clus.id == source))
          ) {
            return { cond2cond: true, msg: "Can't add edge from condition to condition" };
          } else {
            let id = "_" + source + "-" + target;
            if (this.graph.edges.find(arco => arco.id == id && !this.edgeEditing) && !this.edgeEditing) {
              return { already: true, msg: "Already existst an edge between these nodes" };
            }
          }
        }
      }
      return null;
    }
  }

  checkEdgeNode(): ValidatorFn {
    return (control) => {
      if (control.value) {
        if (!this.graph.nodes.find(nodo => nodo.id == control.value) && !this.graph.clusters.find(clus => clus.id == control.value)) {
          return { notFound: true };
        }
      }
      return null;
    }
  }

  //controlla non ci siano gia archi entranti nel nodo condizione
  checkCondNode(): ValidatorFn {
    return (control) => {
      if (this.graph.nodes.find(nodo => nodo.id == control.value && nodo.type == "cond") || this.graph.nodes.find(clus => clus.id == control.value)) {
        if (this.graph.edges.find(arco => arco.target == control.value) && !this.edgeEditing) {
          return { already2cond: true, msg: "Already exists an edge to that condition" };
        }
      } return null;
    }
  }

  // checkEdgeProperty(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     if (control.value && this.edgeForm.controls["edge_data"].value.find((props: any) => props.name == control.value)) {
  //       return { msg: "Already existst a property with this name" };
  //     } else return null;
  //   }
  // }

  checkEdgeWeight(): ValidatorFn {
    return (control) => {
      if (control.value < 1) {
        return { weightError: true, msg: "Edge weight must be at least 1" };
      } else return null;
    }
  }

  checkClusterId(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && !this.clusterEditing) {
        if (this.graph.clusters.find(clus => clus.id == control.value)) {
          return { msg: "Already exists a cluster with this id" };
        }
        if (this.graph.nodes.find(node => node.id == control.value)) {
          return { msg: "Already exists a node with this id" };
        }
      }
      return null;
    }
  }

  checkClusterExists(): ValidatorFn {
    return (control) => {
      if (control.value && !this.graph.clusters.find(clus => clus.id == control.value)) {
        return { clusterNotFound: true, msg: "Cluster not found" }
      } else return null;
    }
  }

  checkCondNodeTask(): ValidatorFn {
    return (control) => {
      if (control.value) {
        if (!this.graph.nodes.filter(node => node.type != "clus" && node.type != "cond").find(nodo => nodo.id == control.value)) {
          return { notFound: true };
        }
      }
      return null;
    }
  }

  checkCondForm(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        let source = control.value.cond_source;
        let target = control.value.cond_target;
        if (source && target) {
          source = control.value.cond_source;
          target = control.value.cond_target;
          if (source == target) {
            return { loop: true, msg: "Source and target must be different" };
          }
        }
      }
      return null;
    }
  }

  checkCondPresent(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        if (control.value.length == 0) {
          return { noConds: true, msg: "Must specify at least one condition" };
        }
      }
      return null;
    }
  }

  checkNodeConds(): ValidatorFn {
    return (control) => {
      // if (control.value && control.value.length > 0) {
      //   let last_entry = control.value.length - 1;
      //   if (control.value[last_entry].name == "") {
      //     return { noName: true};
      //   }
      //   if (control.value[last_entry].value == "") {
      //     return {noValue: true};
      //   }
      // }
      return null;
    }
  }

  // passContent(source: any, target: any) : boolean {
  //   source = this.graphEditingService.getNode(source);
  //   target = this.graphEditingService.getNode(target);
  //   if (target.type == "cond" || target.type == "clus" || target.type == "task") return false;

  //   if (source.properties.filter((prop: any) => prop.name == "output")[0] == null) return false;
  //   const contentToSend = source.properties.filter((prop:any) => prop.name == "output")[0].value;
  //   let input = {id: target.properties.length+1, name: "input", value: contentToSend};
  //   target.properties.push(input);
  //   return true;
  // }

}
