import { Graph, GraphEditingService } from 'src/app/layout/main/graph/graph-editing.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node } from 'src/app/layout/main/graph/graph-editing.service';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { NodeBasicsComponent } from '../../node-basics/node-basics.component';
import { Subscription } from 'rxjs';
import { FlowNodesComponent } from '../flow-nodes.component';

@Component({
  selector: 'app-mongo-import-node',
  templateUrl: './mongo-import-node.component.html',
  styleUrls: ['./mongo-import-node.component.scss']
})
export class MongoImportNodeComponent extends FlowNodesComponent implements OnDestroy{

  constructor(protected fb: FormBuilder, protected gs: GraphEditingService, protected sb: SidebarEditComponent) {
    super(fb, gs, sb, "mongo-in", new FormGroup({
      node_db: new FormControl(null, Validators.required),
      node_collection: new FormControl(null, Validators.required),
    }));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  selectedNodeInputChange(node: any) {
    super.selectedNodeInputChange(node);
    const content = JSON.parse(node.content);
    this.getControl("node_db").setValue(content["db"]);
    this.getControl("node_collection").setValue(content["collection"]);
  }

  tryNode() {
    let node = this.retrieveNodeBasics();
    let db = this.getControl("node_db").value;
    let collection = this.getControl("node_collection").value;
    let node_content = JSON.stringify({
      "db": db,
      "collection": collection,
    });
    this.writeNode(node, node_content);
  }
}
