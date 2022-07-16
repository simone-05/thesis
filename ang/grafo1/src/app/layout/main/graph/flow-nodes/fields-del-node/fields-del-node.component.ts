import { FlowNode } from './../../../../../shared/flow_nodes-interface';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Graph, GraphEditingService, Node } from '../../graph-editing.service';

@Component({
  selector: 'app-fields-del-node',
  templateUrl: './fields-del-node.component.html',
  styleUrls: ['./fields-del-node.component.scss']
})
export class FieldsDelNodeComponent implements OnInit {
  fieldsDelForm: FormGroup;
  nodeEditing: boolean;
  type: string = "fields-del";

  constructor(private fb: FormBuilder, private gs: GraphEditingService, private sb: SidebarEditComponent) {
    this.nodeEditing = false;
    this.fieldsDelForm = this.fb.group({
      node_id: [null, [Validators.required, this.checkNodeId()]],
      node_label: null,
      // node_fields: [null, [Validators.required, this.checkNodeFields()]],
      node_fields: this.fb.array([]),
    });

    this.sb.nodeSelected$.subscribe((node: Node) => {
      if (node?.type == this.type) {
        this.selectedNodeInputChange(node);
      }
    });
  }

  ngOnInit(): void {
  }

  selectedNodeInputChange(node: any) {
    this.nodeEditing = true;
    this.getControl("node_id").setValue(node.id);
    this.getControl("node_label").setValue(node.label);
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
    let node_id = this.getControl("node_id").value;
    let node_label = this.getControl("node_label").value || "";
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
    let node_id = this.getControl("node_id").value;
    this.gs.deleteNode(node_id);
    this.clearNodeInput();
  }

  clearNodeInput() {
    this.nodeEditing = false;
    this.fieldsDelForm.reset();
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

}
