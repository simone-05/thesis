import { Graph, GraphEditingService } from 'src/app/layout/main/graph/graph-editing.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Node } from 'src/app/layout/main/graph/graph-editing.service';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { NodeBasicsComponent } from '../../node-basics/node-basics.component';
import { Subscription } from 'rxjs';
import { FlowNodesComponent } from '../flow-nodes.component';

@Component({
  selector: 'app-mongo-write-node',
  templateUrl: './mongo-write-node.component.html',
  styleUrls: ['./mongo-write-node.component.scss']
})
export class MongoWriteNodeComponent extends FlowNodesComponent implements OnDestroy{

  constructor(protected fb: FormBuilder, protected gs: GraphEditingService, protected sb: SidebarEditComponent) {
    super(fb, gs, sb, "mongo-out", new FormGroup({
      node_db: new FormControl(null, Validators.required),
      node_collection: new FormControl(null, Validators.required),
    }));
  }

  ngOnDestroy(): void {
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
