import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node, Edge, Graph, GraphEditingService } from '../../graph-editing.service';

@Component({
  selector: 'app-inject-node',
  templateUrl: './inject-node.component.html',
  styleUrls: ['./inject-node.component.scss']
})
export class InjectNodeComponent implements OnInit, OnDestroy {
  injectForm: FormGroup;
  nodeEditing: boolean;
  editorOptions = { theme: 'vs', language: 'json', lineNumbers: "off" };
  node_subscription: Subscription;


  constructor(private fb: FormBuilder, private gs: GraphEditingService, private sb: SidebarEditComponent) {
    this.nodeEditing = false;
    this.injectForm = this.fb.group({
      node_id: [null, [Validators.required, this.checkNodeId()]],
      node_label: null,
      node_content: null,
    });

    this.node_subscription = this.sb.nodeSelected$.subscribe((node: Node) => {
      if (node?.type == "inject") {
        this.selectedNodeInputChange(node);
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.node_subscription.unsubscribe();
  }

  selectedNodeInputChange(node: any) {
    this.nodeEditing = true;
    this.getControl("node_id").setValue(node.id);
    this.getControl("node_label").setValue(node.label);
    this.getControl("node_content").setValue(node.content);
  }

  get graph(): Graph {
    return this.gs.graph;
  }

  getControl(x: string) {
    return this.injectForm.controls[x];
  }

  tryNode() {
    let node_id = this.getControl("node_id").value;
    let node_label = this.getControl("node_label").value || "";
    // let node_data: any[string] = [{id: "1", name: "content", value: this.getControl("node_content").value}];
    // let node_properties: any[string] = [];
    let node_content = this.getControl("node_content").value;
    let node: FlowNode = new FlowNode(node_id, node_label, "inject", [], node_content);
    if (this.nodeEditing) {
      this.gs.editNode(node);
    } else {
      this.gs.addNode(node);
    }
    this.clearNodeInput();
  }

  deleteNode() {
    let node_id = this.getControl("node_id").value;
    this.gs.deleteNode(node_id);
    this.clearNodeInput();
  }

  clearNodeInput() {
    this.nodeEditing = false;
    this.injectForm.reset();
  }

  checkNodeId(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        if (!this.nodeEditing) {
          if (/[_-\s]/g.test(control.value)) {
            return { illegalCharacters: true, msg: "Can't contain any _ - or whitespaces" }
          }
          if (this.graph.nodes.find(nodo => nodo.id == control.value)) {
            return { already: true, msg: "Already exists a node with this id" };
          }
        }
      }
      return null;
    }
  }
}
