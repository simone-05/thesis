import { Graph, GraphEditingService } from 'src/app/layout/main/graph/graph-editing.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node } from 'src/app/layout/main/graph/graph-editing.service';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-number-ops-node',
  templateUrl: './number-ops-node.component.html',
  styleUrls: ['./number-ops-node.component.scss']
})
export class NumberOpsNodeComponent implements OnDestroy {
  numberOpsForm: FormGroup;
  nodeEditing: boolean;
  type: string = "number-ops";
  // needSubOp: boolean = false;
  operation_value_sub: Subscription;

  RegExp = RegExp;

  constructor(private fb: FormBuilder, private gs: GraphEditingService, private sb: SidebarEditComponent) {
    this.nodeEditing = false;
    this.numberOpsForm = this.fb.group({
      node_id: [null, [Validators.required, this.checkNodeId()]],
      node_label: null,
      node_operation: [null, Validators.required],
      // node_sub_operation: null,
      node_fields: [null, Validators.required],
      node_digits: null,
    });

    this.operation_value_sub = this.numberOpsForm.controls["node_operation"].valueChanges.subscribe(x => {
      this.changedOp(x);
    });

    this.sb.nodeSelected$.subscribe((node: Node) => {
      if (node?.type == this.type) {
        this.selectedNodeInputChange(node);
      }
    });
  }

  ngOnDestroy() {
    this.operation_value_sub.unsubscribe();
  }

  selectedNodeInputChange(node: any) {
    this.nodeEditing = true;
    this.getControl("node_id").setValue(node.id);
    this.getControl("node_label").setValue(node.label);
    const content = JSON.parse(node.content);
    this.getControl("node_operation").setValue(content["operation"]);
    // this.getControl("node_sub_operation").setValue(content["sub-operation"]);
    this.getControl("node_fields").setValue(content["fields"]);
    this.getControl("node_digits").setValue(content["digits"]);
  }

  get graph(): Graph {
    return this.gs.graph;
  }

  getControl(x: string) {
    return this.numberOpsForm.controls[x];
  }

  tryNode() {
    let node_id = this.getControl("node_id").value;
    let node_label = this.getControl("node_label").value || "";
    let operation = this.getControl("node_operation").value;
    // let sub_operation = this.getControl("node_sub_operation").value;
    let fields: string[] = this.getControl("node_fields").value.toString().split(",").map((x: string) => x.trim()).filter((x: string) => x);
    let digits = this.getControl("node_digits").value;
    let node_content = JSON.stringify({
      "operation": operation,
      // "sub-operation": sub_operation,
      "fields": fields,
      "digits": digits,
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
    // this.needSubOp = false;
    this.numberOpsForm.reset();
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

  changedOp(selection: string) {
    if (/.*(trim|round).*/g.test(selection)) {
      // this.needSubOp = true;
      this.getControl("node_digits").addValidators([Validators.required, this.digitsCheck()]);
      this.getControl("node_digits").updateValueAndValidity();
    } else {
      // this.needSubOp = false;
      this.getControl("node_digits").clearValidators();
      this.getControl("node_digits").updateValueAndValidity();
    }
  }

  // changedSubOp(selection: string) {
  //   if (/.*replace.*/g.test(selection)) {
  //   } else {
  //   }
  // }

  digitsCheck() {
    return (control: AbstractControl) => {
      if (control.value && control.value < 0) {
          return { negative: true, msg: "The number of digits must be non negative"};
      }
      return null;
    }
  }
}