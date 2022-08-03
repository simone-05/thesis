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
    content["fields"].forEach((x: string) => {
      this.addField(x);
    });
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
    let node_content = JSON.stringify({
      "operation": operation,
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
    this.flowNodeForm.updateValueAndValidity(); //NECESSARIO
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
