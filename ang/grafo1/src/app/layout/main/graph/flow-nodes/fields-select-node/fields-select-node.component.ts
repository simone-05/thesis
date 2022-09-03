import { Graph, GraphEditingService } from 'src/app/layout/main/graph/graph-editing.service';
import { Component, DoCheck, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node } from 'src/app/layout/main/graph/graph-editing.service';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { Subscription } from 'rxjs';
import { NodeBasicsComponent } from '../../node-basics/node-basics.component';
import { FlowNodesComponent } from '../flow-nodes.component';

@Component({
  selector: 'app-fields-select-node',
  templateUrl: './fields-select-node.component.html',
  styleUrls: ['./fields-select-node.component.scss']
})
export class FieldsSelectNodeComponent extends FlowNodesComponent implements OnDestroy {
  isCollapsed: boolean = true;

  RegExp = RegExp;

  constructor(protected fb: FormBuilder, protected gs: GraphEditingService, protected sb: SidebarEditComponent) {
    super(fb, gs, sb, "fields-sel", new FormGroup({
      node_operation: new FormControl(null, Validators.required),
      node_fields: new FormArray([], Validators.required),
    }));
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  selectedNodeInputChange(node: any) {
    super.selectedNodeInputChange(node);
    const content = JSON.parse(node.content);
    this.getControl("node_operation").setValue(content["operation"]);
    // this.getControl("node_fields").setValue(content["fields"]);
    this.flowNodeForm.controls["node_fields"] = new FormArray([], Validators.required);
    for (let i = 0; i < content["fields"].length; i++) {
      const element = {"field": content["fields"][i], "new_field":content["new_fields"][i]};
      this.addField(element);
    }
    this.flowNodeForm.updateValueAndValidity(); //NECESSARIO
  }

  get fieldsForm(): FormArray {
    return this.getControl("node_fields") as FormArray;
  }

  tryNode() {
    let node = this.retrieveNodeBasics();
    let operation = this.getControl("node_operation").value;
    // let fields: string[] = this.getControl("node_fields").value.toString().split(",").map((x: string) => x.trim()).filter((x: string) => x);
    let fields: string[] = this.fieldsForm.value.map((x: { field: string }) => x.field);
    let new_fields: string[] = this.fieldsForm.value.map((x: { new_field: string }) => x.new_field);
    let node_content = JSON.stringify({
      "operation": operation,
      "fields": fields,
      "new_fields": new_fields,
    });
    this.writeNode(node, node_content);
  }

  clearNodeInput() {
    super.clearNodeInput();
    this.flowNodeForm.controls["node_fields"] = this.fb.array([], Validators.required);
  }

  addField(element?: any) {
    const dato = this.fb.group({
      field: [(element) ? element.field : null, [Validators.required, this.checkField()]],
      new_field: [(element) ? element.new_field: "",[this.checkNewField()]],
    });
    this.fieldsForm.push(dato);
  }

  removeField(i: number) {
    this.fieldsForm.removeAt(i);
    this.flowNodeForm.updateValueAndValidity(); //NECESSARIO
  }

  checkField(): ValidatorFn {
    return (control) => {
      if (control.value) {
        if (RegExp("^[.]|[.]$").test(control.value)) {
          return { startEndDots: true, msg: "Can't start or end with dots" };
        }
        if (this.fieldsForm.value.find((element: { field: string, new_field: string }) => element.field == control.value) && control.dirty) {
          return { already: true, msg: "Field already selected" };
        }
      }
      return null;
    }
  }

  checkNewField(): ValidatorFn {
    return (control) => {
      if (control.value) {
        if (this.fieldsForm.value.find((element: { field: string, new_field: string }) => element.field == control.value) && control.dirty) {
          return { already: true, msg: "Field already selected" };
        }
      }
      return null;
    }
  }
}
