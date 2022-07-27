import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node, Edge, Graph, GraphEditingService } from '../../graph-editing.service';

@Component({
  selector: 'app-inject-node',
  templateUrl: './inject-node.component.html',
  styleUrls: ['./inject-node.component.scss']
})
export class InjectNodeComponent implements OnDestroy {
  injectForm: FormGroup;
  nodeEditing: boolean;
  editorOptions = { theme: 'vs', language: 'json', lineNumbers: "on"};
  node_subscription: Subscription;
  basicsForm: { id: string, label: string | null, valid: boolean } = { id: "null", label: null, valid: false };
  nodeBasicsId: any;
  nodeBasicsLabel: any;
  nodeBasicsReset: any;

  constructor(private fb: FormBuilder, private gs: GraphEditingService, private sb: SidebarEditComponent) {
    this.nodeEditing = false;
    this.injectForm = this.fb.group({
      node_content: null,
    }, { validators: this.nodeBasicsValidation()});

    this.node_subscription = this.sb.nodeSelected$.subscribe((node: Node) => {
      if (node?.type == "inject") {
        this.selectedNodeInputChange(node);
      }
    });
  }

  ngOnDestroy(): void {
    this.node_subscription.unsubscribe();
  }

  selectedNodeInputChange(node: any) {
    this.nodeEditing = true;
    this.nodeBasicsId = node.id;
    this.nodeBasicsLabel = node.label;
    this.getControl("node_content").setValue(node.content);
  }

  get graph(): Graph {
    return this.gs.graph;
  }

  getControl(x: string) {
    return this.injectForm.controls[x];
  }

  tryNode() {
    let node_id = this.basicsForm.id;
    let node_label = this.basicsForm.label||"";
    // let node_data: any[string] = [{id: "1", name: "content", value: this.getControl("node_content").value}];
    // let node_properties: any[string] = [];
    let node_content = this.getControl("node_content").value;
    let node: FlowNode = new FlowNode(node_id, node_label, "inject", [], node_content);
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
    this.injectForm.reset();
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
    this.injectForm.updateValueAndValidity();
  };

  nodeBasicsFormReset() {
    this.nodeBasicsId = null;
    this.nodeBasicsLabel = null;
    this.nodeBasicsReset = !this.nodeBasicsReset;
  }
}
