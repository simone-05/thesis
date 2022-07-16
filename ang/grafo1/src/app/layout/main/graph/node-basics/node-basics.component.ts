import { BehaviorSubject } from 'rxjs';
import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Graph, GraphEditingService } from '../graph-editing.service';

@Component({
  selector: 'app-node-basics',
  templateUrl: './node-basics.component.html',
  styleUrls: ['./node-basics.component.scss']
})
export class NodeBasicsComponent {
  @Input() parentForm: FormGroup;
  @Input() nodeEditing: boolean = false;

  constructor(private fb: FormBuilder, private gs: GraphEditingService) {
    this.parentForm = this.fb.group({
      node_id: [null, [Validators.required, this.checkNodeId()]],
      node_label: null,
      node_type: null,
    });
  }

  public get graph(): Graph {
    return this.gs.graph;
  }

  checkNodeId(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        if (!this.nodeEditing) {
          if (/[_-\s]/g.test(control.value)) {
            return { illegalCharacters: true, msg: "Can't contain any _ - or whitespaces" }
          }
          if (this.graph.nodes.filter(node => node.type != "cond" && node.type != "clus").find(nodo => nodo.id == control.value)) {
            return { already: true, msg: "Already exists a node with this id" };
          }
        }
      }
      return null;
    }
  }
}
