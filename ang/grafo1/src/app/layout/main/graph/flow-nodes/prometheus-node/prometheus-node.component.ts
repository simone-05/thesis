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
  metric_type_sub: Subscription;

  RegExp = RegExp;

  constructor(protected fb: FormBuilder, protected gs: GraphEditingService, protected sb: SidebarEditComponent) {
    super(fb, gs, sb, "prometheus", new FormGroup({
      node_metric_type: new FormControl(null, Validators.required),
      node_histo_start: new FormControl(null),
      node_histo_width: new FormControl(null),
      node_histo_count: new FormControl(null),
      node_fields: new FormArray([], Validators.required),
      node_metric_name: new FormControl(null),
    }));

    this.metric_type_sub = this.flowNodeForm.controls["node_metric_type"].valueChanges.subscribe(x => {
      this.changedOp(x);
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.metric_type_sub.unsubscribe();
  }

  selectedNodeInputChange(node: any) {
    super.selectedNodeInputChange(node);
    const content = JSON.parse(node.content);
    this.getControl("node_metric_type").setValue(content["metric_type"]);
    this.changedOp(this.getControl("node_metric_type").value);
    this.getControl("node_histo_start").setValue(content["histo_start"]);
    this.getControl("node_histo_width").setValue(content["histo_width"]);
    this.getControl("node_histo_count").setValue(content["histo_count"]);
    this.flowNodeForm.controls["node_fields"] = this.fb.array([], Validators.required);
    content["fields"].forEach((x: string) => {
      this.addField(x);
    });
    this.getControl("node_metric_name").setValue(content["metric_name"]);
    this.flowNodeForm.updateValueAndValidity(); // NECESSARIO SE NON CI FOSSE la funzione changedop che lo fa già
  }

  get fieldsForm(): FormArray {
    return this.getControl("node_fields") as FormArray;
  }

  tryNode() {
    let node = this.retrieveNodeBasics();
    let metric_type = this.getControl("node_metric_type").value;
    let histo_start = this.getControl("node_histo_start").value;
    let histo_width = this.getControl("node_histo_width").value;
    let histo_count = this.getControl("node_histo_count").value;
    let metric_name = this.getControl("node_metric_name").value;
    let fields: string[] = this.fieldsForm.value.map((x: { field: string }) => x.field);
    let node_content = JSON.stringify({
      "metric_type": metric_type,
      "histo_start": histo_start,
      "histo_width": histo_width,
      "histo_count": histo_count,
      "fields": fields,
      "metric_name": metric_name,
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

  changedOp(selection: string) {
    if (/.*histogram.*/g.test(selection)) {
      // this.needSubOp = true;
      this.getControl("node_histo_start").addValidators([Validators.required]);
      this.getControl("node_histo_start").updateValueAndValidity();
      this.getControl("node_histo_width").addValidators([Validators.required, this.widthCheck()]);
      this.getControl("node_histo_width").updateValueAndValidity();
      this.getControl("node_histo_count").addValidators([Validators.required, this.countCheck()]);
      this.getControl("node_histo_count").updateValueAndValidity();
    } else {
      // this.needSubOp = false;
      this.getControl("node_histo_start").clearValidators();
      this.getControl("node_histo_start").updateValueAndValidity();
      this.getControl("node_histo_width").clearValidators();
      this.getControl("node_histo_width").updateValueAndValidity();
      this.getControl("node_histo_count").clearValidators();
      this.getControl("node_histo_count").updateValueAndValidity();
    }
  }

  widthCheck() {
    return (control: AbstractControl) => {
      if (control.dirty && control.value <= 0) {
        return { negative: true, msg: "The width must be greater than 0" };
      }
      return null;
    }
  }

  countCheck() {
    return (control: AbstractControl) => {
      if (control.dirty && control.value < 1) {
        return { negative: true, msg: "The count must be at least 1" };
      }
      return null;
    }
  }

}
