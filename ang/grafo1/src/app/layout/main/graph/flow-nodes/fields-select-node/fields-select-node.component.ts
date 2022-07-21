import { Graph, GraphEditingService } from 'src/app/layout/main/graph/graph-editing.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node } from 'src/app/layout/main/graph/graph-editing.service';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fields-select-node',
  templateUrl: './fields-select-node.component.html',
  styleUrls: ['./fields-select-node.component.scss']
})
export class FieldsSelectNodeComponent {
  fieldsSelForm: FormGroup;
  nodeEditing: boolean;
  type: string = "fields-sel";

  constructor(private fb: FormBuilder, private gs: GraphEditingService, private sb: SidebarEditComponent) {
    this.nodeEditing = false;
    this.fieldsSelForm = this.fb.group({
      node_id: [null, [Validators.required, this.checkNodeId()]],
      node_label: null,
      node_operation: [null, Validators.required],
      node_fields: [null, Validators.required],
    });

    this.sb.nodeSelected$.subscribe((node: Node) => {
      if (node?.type == this.type) {
        this.selectedNodeInputChange(node);
      }
    });
  }

  selectedNodeInputChange(node: any) {
    this.nodeEditing = true;
    this.getControl("node_id").setValue(node.id);
    this.getControl("node_label").setValue(node.label);
    const content = JSON.parse(node.content);
    this.getControl("node_operation").setValue(content["operation"]);
    this.getControl("node_fields").setValue(content["fields"]);
  }

  get graph(): Graph {
    return this.gs.graph;
  }

  getControl(x: string) {
    return this.fieldsSelForm.controls[x];
  }

  tryNode() {
    let node_id = this.getControl("node_id").value;
    let node_label = this.getControl("node_label").value || "";
    let operation = this.getControl("node_operation").value;
    let fields: string[] = this.getControl("node_fields").value.toString().split(",").map((x: string) => x.trim()).filter((x: string) => x);
    let node_content = JSON.stringify({
      "operation": operation,
      "fields": fields,
    });
    let node: FlowNode = new FlowNode(node_id, node_label, this.type, [], node_content);
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
    this.fieldsSelForm.reset();
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
