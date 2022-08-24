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
  selector: 'app-number-ops-node',
  templateUrl: './number-ops-node.component.html',
  styleUrls: ['./number-ops-node.component.scss']
})
export class NumberOpsNodeComponent extends FlowNodesComponent implements OnDestroy {
  // needSubOp: boolean = false;
  operation_value_sub: Subscription;
  isCollapsed: boolean = true;

  RegExp = RegExp;

  constructor(protected fb: FormBuilder, protected gs: GraphEditingService, protected sb: SidebarEditComponent) {
    super(fb, gs, sb, "number-ops", new FormGroup({
      node_operation: new FormControl(null, Validators.required),
      // node_sub_operation: null,
      node_fields: new FormArray([], Validators.required),
      node_digits: new FormControl(null),
    }));

    this.operation_value_sub = this.flowNodeForm.controls["node_operation"].valueChanges.subscribe(x => {
      this.changedOp(x);
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.operation_value_sub.unsubscribe();
  }

  selectedNodeInputChange(node: any) {
    super.selectedNodeInputChange(node);
    const content = JSON.parse(node.content);
    this.getControl("node_operation").setValue(content["operation"]);
    this.changedOp(this.getControl("node_operation").value);
    // this.getControl("node_sub_operation").setValue(content["sub-operation"]);
    // this.getControl("node_fields").setValue(content["fields"]);
    this.flowNodeForm.controls["node_fields"] = this.fb.array([], Validators.required);
    content["fields"].forEach((x: string) => {
      this.addField(x);
    });
    this.getControl("node_digits").setValue(content["digits"]);
    this.flowNodeForm.updateValueAndValidity(); // NECESSARIO SE NON CI FOSSE la funzione changedop che lo fa già
  }

  get fieldsForm(): FormArray {
    return this.getControl("node_fields") as FormArray;
  }

  tryNode() {
    let node = this.retrieveNodeBasics();
    let operation = this.getControl("node_operation").value;
    // let sub_operation = this.getControl("node_sub_operation").value;
    // let fields: string[] = this.getControl("node_fields").value.toString().split(",").map((x: string) => x.trim()).filter((x: string) => x);
    let fields: string[] = this.fieldsForm.value.map((x: { field: string }) => x.field);
    let digits = this.getControl("node_digits").value;
    let node_content = JSON.stringify({
      "operation": operation,
      // "sub-operation": sub_operation,
      "fields": fields,
      "digits": digits,
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
