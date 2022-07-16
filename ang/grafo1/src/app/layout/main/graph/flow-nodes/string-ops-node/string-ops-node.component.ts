import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Graph, GraphEditingService, Node } from '../../graph-editing.service';

@Component({
  selector: 'app-string-ops-node',
  templateUrl: './string-ops-node.component.html',
  styleUrls: ['./string-ops-node.component.scss']
})
export class StringOpsNodeComponent {
  stringOpsForm: FormGroup;
  nodeEditing: boolean;
  type: string = "string-ops";
  needSubOp: boolean = false;
  RegExp = RegExp;

  constructor(private fb: FormBuilder, private gs: GraphEditingService, private sb: SidebarEditComponent) {
    this.nodeEditing = false;
    this.stringOpsForm = this.fb.group({
      node_id: [null, [Validators.required, this.checkNodeId()]],
      node_label: null,
      node_operation: [null, Validators.required],
      node_sub_operation: null,
      node_field: [null, Validators.required],
      node_regex_pattern: null,
      node_regex_replace: null,
    });

    this.sb.nodeSelected$.subscribe((node: Node) => {
      if (node?.type == this.type) {
        this.selectedNodeInputChange(node);
      }
    });
  }

  selectedNodeInputChange(node: any) {
    this.nodeEditing = true;
    this.getControl("node_id").setValue(node.id);
    this.getControl("node_label").setValue(node.label);
    const content = JSON.parse(node.content);
    this.getControl("node_operation").setValue(content["operation"]);
    this.getControl("node_sub_operation").setValue(content["sub-operation"]);
    this.getControl("node_field").setValue(content["field"]);
    this.getControl("node_regex_pattern").setValue(content["regex"]);
    this.getControl("node_regex_replace").setValue(content["replace"]);
  }

  get graph(): Graph {
    return this.gs.graph;
  }

  getControl(x: string) {
    return this.stringOpsForm.controls[x];
  }

  tryNode() {
    let node_id = this.getControl("node_id").value;
    let node_label = this.getControl("node_label").value || "";
    let operation = this.getControl("node_operation").value;
    let sub_operation = this.getControl("node_sub_operation").value;
    let field = this.getControl("node_field").value;
    let regex = this.getControl("node_regex_pattern").value;
    let replace = this.getControl("node_regex_replace").value;
    let node_content = JSON.stringify({
      "operation": operation,
      "sub-operation": sub_operation,
      "field": field,
      "regex": regex,
      "replace": replace,
    });
    let node: FlowNode = new FlowNode(node_id, node_label, this.type, [], node_content);
    if (this.nodeEditing) {
      this.gs.editNode(node);
    } else {
      this.gs.addNode(node);
    }
    this.clearNodeInput();
  }

  deleteNode() {
    let node_id = this.getControl("node_id").value;
    this.gs.deleteNode(node_id);
    this.clearNodeInput();
  }

  clearNodeInput() {
    this.nodeEditing = false;
    this.needSubOp = false;
    this.stringOpsForm.reset();
  }

  checkNodeId(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        if (!this.nodeEditing) {
          if (/[_-\s]/g.test(control.value)) {
            return { illegalCharacters: true, msg: "Can't contain any _ - or whitespaces" }
          }
          if (this.graph.nodes.find(nodo => nodo.id == control.value)) {
            return { already: true, msg: "Already exists a node with this id" };
          }
        }
      }
      return null;
    }
  }

  // subOpCheck(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors|null => {
  //     console.log("chiamo");
  //     if (this.needSubOp && !control.value) {
  //       console.log("controllo");
  //       // if (control.value == null || control.value == "") {
  //         return { no_sub_operation: true };
  //       // }
  //       }
  //     return null;
  //   };
  // }

  // regexCheck() {
  //   return (control: AbstractControl) => {
  //     if (!control.value) {
  //       if (this.stringOpsForm) {
  //         if (/regex*/g.test(this.getControl("node_operation").value)) {
  //           return { empty_regex: true };
  //         }
  //       }
  //     }
  //     return null;
  //   };
  // }

  changedOp(selection: string) {
    if (/.*regex.*/g.test(selection)) {
      this.needSubOp = true;
      this.getControl("node_sub_operation").addValidators([Validators.required]);
      this.getControl("node_sub_operation").updateValueAndValidity();
      this.getControl("node_regex_pattern").addValidators([Validators.required]);
      this.getControl("node_regex_pattern").updateValueAndValidity();
    } else {
      this.needSubOp = false;
      this.getControl("node_sub_operation").clearValidators();
      this.getControl("node_sub_operation").updateValueAndValidity();
      this.getControl("node_regex_pattern").clearValidators();
      this.getControl("node_regex_pattern").updateValueAndValidity();
    }
  }

  changedSubOp(selection: string) {
    if (/.*replace.*/g.test(selection)) {
      this.getControl("node_regex_replace").addValidators([Validators.required]);
      this.getControl("node_regex_replace").updateValueAndValidity();
    } else {
      this.getControl("node_regex_replace").clearValidators();
      this.getControl("node_regex_replace").updateValueAndValidity();
    }
  }
}
