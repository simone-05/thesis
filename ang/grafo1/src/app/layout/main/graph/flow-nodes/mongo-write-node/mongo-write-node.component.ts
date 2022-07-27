import { Graph, GraphEditingService } from 'src/app/layout/main/graph/graph-editing.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node } from 'src/app/layout/main/graph/graph-editing.service';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';

@Component({
  selector: 'app-mongo-write-node',
  templateUrl: './mongo-write-node.component.html',
  styleUrls: ['./mongo-write-node.component.scss']
})
export class MongoWriteNodeComponent {
  mongoWriteForm: FormGroup;
  nodeEditing: boolean;
  type: string = "mongo-out";
  basicsForm: { id: string, label: string | null, valid: boolean } = { id: "null", label: null, valid: false };
  nodeBasicsId: any;
  nodeBasicsLabel: any;
  nodeBasicsReset: any;

  constructor(private fb: FormBuilder, private gs: GraphEditingService, private sb: SidebarEditComponent) {
    this.nodeEditing = false;
    this.mongoWriteForm = this.fb.group({
      node_db: [null, Validators.required],
      node_collection: [null, Validators.required],
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
    this.getControl("node_db").setValue(content["db"]);
    this.getControl("node_collection").setValue(content["collection"]);
  }

  get graph(): Graph {
    return this.gs.graph;
  }

  getControl(x: string) {
    return this.mongoWriteForm.controls[x];
  }

  tryNode() {
    let node_id = this.basicsForm.id;
    let node_label = this.basicsForm.label || "";
    let db = this.getControl("node_db").value;
    let collection = this.getControl("node_collection").value;
    let node_content = JSON.stringify({
      "db": db,
      "collection": collection,
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
    this.mongoWriteForm.reset();
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
    this.mongoWriteForm.updateValueAndValidity();
  };

  nodeBasicsFormReset() {
    this.nodeBasicsId = null;
    this.nodeBasicsLabel = null;
    this.nodeBasicsReset = !this.nodeBasicsReset;
  }

}
