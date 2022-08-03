import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { GraphEditingService } from '../../graph-editing.service';
import { FlowNodesComponent } from '../flow-nodes.component';

@Component({
  selector: 'app-debug-node',
  templateUrl: './debug-node.component.html',
  styleUrls: ['./debug-node.component.scss']
})
export class DebugNodeComponent extends FlowNodesComponent implements OnDestroy {

  constructor(protected fb: FormBuilder, protected gs: GraphEditingService, protected sb: SidebarEditComponent) {
    super(fb, gs, sb, "debug", new FormGroup({
      node_label: new FormControl(null)
    }));
  }

  tryNode() {
    this.writeNode(this.retrieveNodeBasics(), "");
  }
}
