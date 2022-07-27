import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node, GraphEditingService, Graph, Edge } from '../../graph-editing.service';

@Component({
  selector: 'app-debug-node',
  templateUrl: './debug-node.component.html',
  styleUrls: ['./debug-node.component.scss']
})
export class DebugNodeComponent implements OnDestroy {
  debugForm: FormGroup;
  nodeEditing: boolean;
  type: string = "debug";
  node_subscription: Subscription;
  basicsForm: { id: string, label: string | null, valid: boolean } = { id: "null", label: null, valid: false };
  nodeBasicsId: any;
  nodeBasicsLabel: any;
  nodeBasicsReset: any;

  constructor(private fb: FormBuilder, private gs: GraphEditingService, private sb: SidebarEditComponent) {
    this.nodeEditing = false;
    this.debugForm = this.fb.group({
      node_label: null
    }, { validators: this.nodeBasicsValidation() });

    this.node_subscription = this.sb.nodeSelected$.subscribe((node: Node) => {
      if (node?.type == "debug") {
        this.selectedNodeInputChange(node);
      }
    });
  }

  ngOnDestroy(): void {
    this.node_subscription.unsubscribe;
  }

  selectedNodeInputChange(node: any) {
    this.nodeEditing = true;
    this.nodeBasicsId = node.id;
    this.nodeBasicsLabel = node.label;
  }

  get graph(): Graph {
    return this.gs.graph;
  }

  getControl(x: string) {
    return this.debugForm.controls[x];
  }

  tryNode() {
    let node_id = this.basicsForm.id;
    let node_label = this.basicsForm.label || "";
    let node: FlowNode = new FlowNode(node_id, node_label, this.type, [], "");
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
    this.debugForm.reset();
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
    this.debugForm.updateValueAndValidity();
  };

  nodeBasicsFormReset() {
    this.nodeBasicsId = null;
    this.nodeBasicsLabel = null;
    this.nodeBasicsReset = !this.nodeBasicsReset;
  }
}
