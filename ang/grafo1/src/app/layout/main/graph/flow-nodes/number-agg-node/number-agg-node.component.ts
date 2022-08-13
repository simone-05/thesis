import { Graph, GraphEditingService } from 'src/app/layout/main/graph/graph-editing.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node } from 'src/app/layout/main/graph/graph-editing.service';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { NodeBasicsComponent } from '../../node-basics/node-basics.component';
import { FlowNodesComponent } from '../flow-nodes.component';

@Component({
  selector: 'app-number-agg-node',
  templateUrl: './number-agg-node.component.html',
  styleUrls: ['./number-agg-node.component.scss']
})
export class NumberAggNodeComponent extends FlowNodesComponent implements OnDestroy {
  isCollapsed: boolean = true;

  RegExp = RegExp;

  constructor(protected fb: FormBuilder, protected gs: GraphEditingService, protected sb: SidebarEditComponent) {
    super(fb, gs, sb, "number-agg", new FormGroup({
      node_operation: new FormControl(null, Validators.required),
      node_fields: new FormArray([], Validators.required),
      node_new_field: new FormControl(null, Validators.required),
      // node_per_doc: new FormControl(null, Validators.required),
    }));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    // this.operation_value_sub.unsubscribe();
  }

  selectedNodeInputChange(node: any) {
    super.selectedNodeInputChange(node);
    const content = JSON.parse(node.content);
    this.getControl("node_operation").setValue(content["operation"]);
    this.flowNodeForm.controls["node_fields"] = this.fb.array([], Validators.required);
    content["fields"].forEach((x: string) => {
      this.addField(x);
    });
    this.getControl("node_new_field").setValue(content["new_field"]);
    // this.getControl("node_per_doc").setValue(content["per_doc"]);
    this.flowNodeForm.updateValueAndValidity(); // NECESSARIO SE NON CI FOSSE la funzione changedop che lo fa già
  }

  get fieldsForm(): FormArray {
    return this.getControl("node_fields") as FormArray;
  }

  tryNode() {
    let node = this.retrieveNodeBasics();
    let operation = this.getControl("node_operation").value;
    let fields: string[] = this.fieldsForm.value.map((x: { field: string }) => x.field);
    let new_field = this.getControl("node_new_field").value;
    // let per_doc = this.getControl("node_per_doc").value;
    let node_content = JSON.stringify({
      "operation": operation,
      "fields": fields,
      "new_field": new_field,
      // "per_doc": per_doc,
    });
    this.writeNode(node, node_content);
  }

  clearNodeInput() {
    super.clearNodeInput();
    // this.needSubOp = false;
    this.flowNodeForm.controls["node_fields"] = this.fb.array([], Validators.required);
  }

  addField(field_name?: string) {
    const dato = this.fb.group({
      field: [(field_name) ? field_name : null, [Validators.required, this.checkField()]]
    });
    this.fieldsForm.push(dato);
  }

  removeField(i: number) {
    this.fieldsForm.removeAt(i);
    this.flowNodeForm.updateValueAndValidity();
  }

  checkField(): ValidatorFn {
    return (control) => {
      if (control.value) {
        if (this.fieldsForm.value.find((element: { field: string }) => element.field == control.value) && control.dirty) {
          return { already: true, msg: "Field already selected" };
        }
      }
      return null;
    }
  }
}
