import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { DebugNode } from 'src/app/shared/flow_nodes-interface';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node, GraphEditingService, Graph, Edge } from '../../graph-editing.service';

@Component({
  selector: 'app-debug-node',
  templateUrl: './debug-node.component.html',
  styleUrls: ['./debug-node.component.scss']
})
export class DebugNodeComponent implements OnInit, OnDestroy {
  debugForm: FormGroup;
  nodeEditing: boolean;
  node_subscription: Subscription;

  constructor(private fb: FormBuilder, private gs: GraphEditingService, private sb: SidebarEditComponent) {
    this.nodeEditing = false;
    this.debugForm = this.fb.group({
      node_id: [null, [Validators.required, this.checkNodeId()]],
      node_label: null
    });

    this.node_subscription = this.sb.nodeSelected$.subscribe((node: Node) => {
      if (node?.type == "debug") {
        this.selectedNodeInputChange(node);
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.node_subscription.unsubscribe;
  }

  selectedNodeInputChange(node: any) {
    this.nodeEditing = true;
    this.getControl("node_id").setValue(node.id);
    this.getControl("node_label").setValue(node.label);
  }

  get graph(): Graph {
    return this.gs.graph;
  }

  getControl(x: string) {
    return this.debugForm.controls[x];
  }

  tryNode() {
    let node_id = this.getControl("node_id").value;
    let node_label = this.getControl("node_label").value || "";
    let node_type = "debug";
    let node_properties: any[string] = [];
    let node: DebugNode = new DebugNode(node_id, node_label, node_properties);
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
    this.debugForm.reset();
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
