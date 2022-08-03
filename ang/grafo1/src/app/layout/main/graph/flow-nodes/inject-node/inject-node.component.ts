import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node, Edge, Graph, GraphEditingService } from '../../graph-editing.service';
import { FlowNodesComponent } from '../flow-nodes.component';

@Component({
  selector: 'app-inject-node',
  templateUrl: './inject-node.component.html',
  styleUrls: ['./inject-node.component.scss']
})
export class InjectNodeComponent extends FlowNodesComponent implements OnDestroy {
  editorOptions = { theme: 'vs', language: 'json', lineNumbers: "on"};

  constructor(protected fb: FormBuilder, protected gs: GraphEditingService, protected sb: SidebarEditComponent) {
    super(fb, gs, sb, "inject", new FormGroup(
      {
      node_content: new FormControl(null)
      }
    ));
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  selectedNodeInputChange(node: any) {
    super.selectedNodeInputChange(node);
    this.getControl("node_content").setValue(node.content);
  }

  tryNode() {
    let node = this.retrieveNodeBasics();
    // let node_data: any[string] = [{id: "1", name: "content", value: this.getControl("node_content").value}];
    // let node_properties: any[string] = [];
    let node_content = this.getControl("node_content").value;
    this.writeNode(node, node_content);
  }
}
