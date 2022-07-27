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
  basicsForm: { id: string, label: string | null, valid: boolean } = { id: "null", label: null, valid: false };
  nodeBasicsId: any;
  nodeBasicsLabel: any;
  nodeBasicsReset: any;

  constructor(private fb: FormBuilder, private gs: GraphEditingService, private sb: SidebarEditComponent) {
    this.nodeEditing = false;
    this.fieldsSelForm = this.fb.group({
      node_operation: [null, Validators.required],
      node_fields: [null, Validators.required],
    }, { validators: this.nodeBasicsValidation() });

    this.sb.nodeSelected$.subscribe((node: Node) => {
      if (node?.type == this.type) {
        this.selectedNodeInputChange(node);
      }
    });
  }

  selectedNodeInputChange(node: any) {
    this.nodeEditing = true;
    this.nodeBasicsId = node.id;
    this.nodeBasicsLabel = node.label;
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
    let node_id = this.basicsForm.id;
    let node_label = this.basicsForm.label || "";
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
    let node_id = this.basicsForm.id;
    this.gs.deleteNode(node_id);
    this.clearNodeInput();
  }

  clearNodeInput() {
    this.nodeEditing = false;
    this.fieldsSelForm.reset();
    this.nodeBasicsFormReset();
  }

  nodeBasicsValidation(): ValidatorFn {
    return () => {
      if (this.basicsForm.valid) return null;
      else return { basicsInvalid: true };
    }
  }

  nodeBasicsValidationEvent(event: any) {
    this.basicsForm = event;
    this.fieldsSelForm.updateValueAndValidity();
  };

  nodeBasicsFormReset() {
    this.nodeBasicsId = null;
    this.nodeBasicsLabel = null;
    this.nodeBasicsReset = !this.nodeBasicsReset;
  }
}
