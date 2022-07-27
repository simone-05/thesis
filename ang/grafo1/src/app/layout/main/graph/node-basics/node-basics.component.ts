import { BehaviorSubject, Subscription } from 'rxjs';
import { Component, DoCheck, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Graph, GraphEditingService } from '../graph-editing.service';

@Component({
  selector: 'app-node-basics',
  templateUrl: './node-basics.component.html',
  styleUrls: ['./node-basics.component.scss']
})
export class NodeBasicsComponent implements OnChanges {
  basicsForm: FormGroup;
  @Output() formEmit: EventEmitter<{id: string, label: string|null, valid: boolean}> = new EventEmitter();
  @Input() nodeEditing: any;
  @Input() input_id: any;
  @Input() input_label: any;
  @Input() form_reset: any;
  // @Input() forced_change: any;
  formSubscriber: Subscription;

  constructor(private fb: FormBuilder, private gs: GraphEditingService) {
    this.basicsForm = this.fb.group({
      node_id: [null, [Validators.required, this.checkNodeId()]],
      node_label: null,
    });

    this.formSubscriber = this.basicsForm.valueChanges.subscribe(x => {
      if (x) {
        this.formEmit.emit({id: this.basicsForm.controls["node_id"].value, label: this.basicsForm.controls["node_label"].value, valid: this.basicsForm.valid})
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.basicsForm.controls["node_id"].setValue(changes['input_id']?.currentValue);
    this.basicsForm.controls["node_label"].setValue(changes['input_label']?.currentValue);
    if (changes["form_reset"]) {
      this.basicsForm.reset();
    }
    // if (this.forced_change == 1) {
    //   // reset
    //   this.basicsForm.reset();
    // }

    // if (this.forced_change == 2) {
    //   // set
    //   this.basicsForm.controls["node_id"].setValue(this.input_id);
    //   this.basicsForm.controls["node_label"].setValue(this.input_label);
    // }
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
