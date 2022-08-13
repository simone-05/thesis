import { Graph, GraphEditingService } from 'src/app/layout/main/graph/graph-editing.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node } from 'src/app/layout/main/graph/graph-editing.service';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { NodeBasicsComponent } from '../../node-basics/node-basics.component';
import { FlowNodesComponent } from '../flow-nodes.component'

@Component({
  selector: 'app-prometheus-node',
  templateUrl: './prometheus-node.component.html',
  styleUrls: ['./prometheus-node.component.scss']
})
export class PrometheusNodeComponent extends FlowNodesComponent implements OnDestroy {
  isCollapsed: boolean = true;

  RegExp = RegExp;

  constructor(protected fb: FormBuilder, protected gs: GraphEditingService, protected sb: SidebarEditComponent) {
    super(fb, gs, sb, "prometheus", new FormGroup({
      node_metric_type: new FormControl(null, Validators.required),
      node_fields: new FormArray([], Validators.required),
    }));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  selectedNodeInputChange(node: any) {
    super.selectedNodeInputChange(node);
    const content = JSON.parse(node.content);
    this.getControl("node_metric_type").setValue(content["metric_type"]);
    this.flowNodeForm.controls["node_fields"] = this.fb.array([], Validators.required);
    content["fields"].forEach((x: string) => {
      this.addField(x);
    });
    this.flowNodeForm.updateValueAndValidity(); // NECESSARIO SE NON CI FOSSE la funzione changedop che lo fa già
  }

  get fieldsForm(): FormArray {
    return this.getControl("node_fields") as FormArray;
  }

  tryNode() {
    let node = this.retrieveNodeBasics();
    let metric_type = this.getControl("node_metric_type").value;
    let fields: string[] = this.fieldsForm.value.map((x: { field: string }) => x.field);
    let node_content = JSON.stringify({
      "metric_type": metric_type,
      "fields": fields,
    });
    this.writeNode(node, node_content);
  }

  clearNodeInput() {
    super.clearNodeInput();
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
