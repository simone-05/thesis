import { Component, Inject, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { SidebarEditComponent } from '../edit/sidebar-edit/sidebar-edit.component';
import { Node, GraphEditingService, Graph } from '../graph-editing.service';

@Component({
  selector: 'app-flow-nodes',
  templateUrl: './flow-nodes.component.html',
  styleUrls: ['./flow-nodes.component.scss']
})
export abstract class FlowNodesComponent implements OnDestroy {
  type: string;
  basics_in_form: { id: string, label: string | null, valid: boolean } = { id: "null", label: null, valid: false };
  basics_out_id: string | null = null;
  basics_out_label: string | null = null;
  flowNodeForm!: FormGroup;
  node_subscription: Subscription;
  nodeEditing: boolean;

  constructor(protected fb: FormBuilder, protected gs: GraphEditingService, protected sb: SidebarEditComponent, @Inject("type") type: string, @Inject("flowNodeForm") flowNodeForm: FormGroup) {
    this.type = type;
    this.nodeEditing = false;

    this.flowNodeForm = flowNodeForm;
    this.flowNodeForm.addValidators(this.nodeBasicsValidation());

    this.node_subscription = this.sb.nodeSelected$.subscribe((node: Node) => {
      if (node?.type == this.type) {
        this.selectedNodeInputChange(node);
      }
    });
  }

  ngOnDestroy(): void {
    this.node_subscription.unsubscribe();
  }

  selectedNodeInputChange(node: any) {
    this.clearNodeInput();
    this.nodeEditing = true;
    this.basics_out_id = node.id;
    this.basics_out_label = node.label;
  }

  get graph(): Graph {
    return this.gs.graph;
  }

  getControl(x: string): AbstractControl {
    return this.flowNodeForm?.controls[x];
  }

  /**
   * Correctly sets id and label according to node-basics component form,
   * sets the type, empty array for node data, and empty string content: ""
   * @returns this new FlowNode
   */
  retrieveNodeBasics(): FlowNode {
    let node_id = this.basics_in_form.id;
    let node_label = this.basics_in_form.label || "";
    return new FlowNode(node_id, node_label, this.type, [], "");
  }

  writeNode(node: FlowNode, content: any) {
    node.content = content;
    if (this.nodeEditing) {
      this.gs.editNode(node);
    } else {
      this.gs.addNode(node);
    }
    this.clearNodeInput(); // Ci si riferisce a quella della classe che implementa questa in cui ci si trova, e non quella di questa classe/componente. Cioè è la funzione del figlio e non di questo padre
  }

  deleteNode() {
    let node_id = this.basics_in_form.id;
    this.gs.deleteNode(node_id);
    this.clearNodeInput();
  }

  clearNodeInput() {
    this.nodeEditing = false;
    this.basics_out_id = null;
    this.basics_out_label = null;
    this.flowNodeForm.reset();
  }

  nodeBasicsValidation(): ValidatorFn {
    return () => {
      if (this.basics_in_form.valid) return null;
      else return { basicsInvalid: true };
    }
  }

  catchBasicsForm(event: any) {
    this.basics_in_form = event;
    this.basics_out_id = this.basics_in_form.id;
    this.basics_out_label = this.basics_in_form.label;
    this.flowNodeForm.updateValueAndValidity();
  }
}
