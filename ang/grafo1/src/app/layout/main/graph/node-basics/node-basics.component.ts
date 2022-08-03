import { BehaviorSubject, Subscription } from 'rxjs';
import { Component, DoCheck, EventEmitter, Input, OnChanges, Output, SimpleChanges, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Graph, GraphEditingService } from '../graph-editing.service';

@Component({
  selector: 'app-node-basics',
  templateUrl: './node-basics.component.html',
  styleUrls: ['./node-basics.component.scss']
})
export class NodeBasicsComponent implements OnChanges, OnDestroy {
  basicsForm: FormGroup;
  @Output() formEmit: EventEmitter<{id: string, label: string|null, valid: boolean}> = new EventEmitter();
  @Input() nodeEditing: boolean = false;
  @Input() input_id: string|null = null;
  @Input() input_label: string|null = null;
  formSubscriber: Subscription;

  constructor(private fb: FormBuilder, private gs: GraphEditingService) {
    this.basicsForm = this.fb.group({
      node_id: [null, [Validators.required, this.checkNodeId()]],
      node_label: null,
    });

    this.formSubscriber = this.basicsForm.valueChanges.subscribe(x => {
      this.formEmit.emit({id: this.basicsForm.controls["node_id"].value, label: this.basicsForm.controls["node_label"].value, valid: this.basicsForm.valid})
    });
  }

  ngOnDestroy(): void {
      this.formSubscriber.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["input_id"]) {
      this.basicsForm.controls["node_id"].setValue(changes['input_id'].currentValue);
    }
    if (changes["input_label"]) {
      this.basicsForm.controls["node_label"].setValue(changes['input_label'].currentValue);
    }
  }

  public get graph(): Graph {
    return this.gs.graph;
  }

  public getControl(value: string): AbstractControl {
    return this.basicsForm.controls[value];
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
