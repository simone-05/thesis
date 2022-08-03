import { Subscription } from 'rxjs';
import { FlowNode } from './../../../../../shared/flow_nodes-interface';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Graph, GraphEditingService, Node } from '../../graph-editing.service';

@Component({
  selector: 'app-fields-del-node',
  templateUrl: './fields-del-node.component.html',
  styleUrls: ['./fields-del-node.component.scss']
})
export class FieldsDelNodeComponent implements OnDestroy{
  fieldsDelForm: FormGroup;
  nodeEditing: boolean;
  type: string = "fields-del";
  node_selection: Subscription;
  basicsForm: { id: string, label: string | null, valid: boolean } = { id: "null", label: null, valid: false };
  nodeBasicsId: any;
  nodeBasicsLabel: any;
  nodeBasicsReset: any;

  constructor(private fb: FormBuilder, private gs: GraphEditingService, private sb: SidebarEditComponent) {
    this.nodeEditing = false;
    this.fieldsDelForm = this.fb.group({
      // node_fields: [null, [Validators.required, this.checkNodeFields()]],
      node_fields: this.fb.array([]),
    }, { validators: this.nodeBasicsValidation() });

    this.node_selection = this.sb.nodeSelected$.subscribe((node: Node) => {
      if (node?.type == this.type) {
        this.selectedNodeInputChange(node);
      }
    });
  }

  ngOnDestroy() {
    this.node_selection.unsubscribe();
  }

  selectedNodeInputChange(node: any) {
    this.nodeEditing = true;
    setTimeout(() => {
      this.nodeBasicsId = node.id;
      this.nodeBasicsLabel = node.label;
    }, 10);
    const content = JSON.parse(node.content);
    this.getControl("node_fields").setValue(content["fields"]);
  }

  get graph(): Graph {
    return this.gs.graph;
  }

  getControl(x: string): AbstractControl {
    return this.fieldsDelForm.controls[x];
  }

  tryNode() {
    let node_id = this.basicsForm.id;
    let node_label = this.basicsForm.label || "";
    let fields = this.getControl("node_fields").value;
    let node_content = JSON.stringify({
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
    this.fieldsDelForm.reset();
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
    this.fieldsDelForm.updateValueAndValidity();
  };

  nodeBasicsFormReset() {
    this.nodeBasicsId = null;
    this.nodeBasicsLabel = null;
    this.nodeBasicsReset = !this.nodeBasicsReset;
  }

}
