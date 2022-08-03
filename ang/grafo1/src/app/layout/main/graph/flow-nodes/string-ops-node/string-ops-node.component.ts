import { Component, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FlowNode } from 'src/app/shared/flow_nodes-interface';
import { SidebarEditComponent } from '../../edit/sidebar-edit/sidebar-edit.component';
import { Graph, GraphEditingService, Node } from '../../graph-editing.service';
import { FlowNodesComponent } from '../flow-nodes.component';

@Component({
  selector: 'app-string-ops-node',
  templateUrl: './string-ops-node.component.html',
  styleUrls: ['./string-ops-node.component.scss']
})
export class StringOpsNodeComponent extends FlowNodesComponent implements OnDestroy{
  // flowNodeForm: FormGroup;
  needSubOp: boolean = false;
  op_value_sub: Subscription;
  subOp_value_sub: Subscription;
  isCollapsed: boolean = true;

  RegExp = RegExp;

  constructor(protected fb: FormBuilder, protected gs: GraphEditingService, protected sb: SidebarEditComponent) {
    super(fb, gs, sb, "string-ops", new FormGroup({
      node_operation: new FormControl(null, Validators.required),
      node_sub_operation: new FormControl(null),
      node_fields: new FormArray([], Validators.required),
      node_regex_pattern: new FormControl(null),
      node_regex_replace: new FormControl(null),
    }));

    this.op_value_sub = this.flowNodeForm.controls["node_operation"].valueChanges.subscribe(x => {
      this.changedOp(x);
    });

    this.subOp_value_sub = this.flowNodeForm.controls["node_sub_operation"].valueChanges.subscribe(x => {
      this.changedSubOp(x);
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.op_value_sub.unsubscribe();
    this.subOp_value_sub.unsubscribe();
  }

  selectedNodeInputChange(node: any) {
    super.selectedNodeInputChange(node);
    const content = JSON.parse(node.content);
    this.getControl("node_operation").setValue(content["operation"]);
    this.getControl("node_sub_operation").setValue(content["sub-operation"]);
    // this.getControl("node_fields").setValue(content["fields"]);
    this.flowNodeForm.controls["node_fields"] = this.fb.array([], Validators.required);
    content["fields"].forEach((x: string) => {
      this.addField(x);
    });
    this.getControl("node_regex_pattern").setValue(content["regex"]);
    this.getControl("node_regex_replace").setValue(content["replace"]);
    this.flowNodeForm.updateValueAndValidity(); //NECESSARIO SE NON CI FOSSERO LE FUNZIONI changeOp() e changedsubop che lo fanno già
  }

  get fieldsForm(): FormArray {
    return this.getControl("node_fields") as FormArray;
  }

  tryNode() {
    let node = this.retrieveNodeBasics();
    let operation = this.getControl("node_operation").value;
    let sub_operation = this.getControl("node_sub_operation").value;
    // let fields: string[] = this.getControl("node_fields").value.toString().split(",").map((x:string) => x.trim());
    let fields: string[] = this.fieldsForm.value.map((x: {field: string}) => x.field);
    let regex = this.getControl("node_regex_pattern").value;
    let replace = this.getControl("node_regex_replace").value;
    let node_content = JSON.stringify({
      "operation": operation,
      "sub-operation": sub_operation,
      "fields": fields,
      "regex": regex,
      "replace": replace,
    });
    this.writeNode(node, node_content);
  }

  clearNodeInput() {
    super.clearNodeInput();
    this.needSubOp = false;
    this.flowNodeForm.controls["node_fields"] = this.fb.array([], Validators.required);
  }

  addField(field_name?: string) {
    const dato = this.fb.group({
      field: [(field_name)?field_name:null, [Validators.required, this.checkField()]]
    });
    this.fieldsForm.push(dato);
  }

  removeField(i: number) {
    this.fieldsForm.removeAt(i);
    this.flowNodeForm.updateValueAndValidity();
  }

  checkField(): ValidatorFn {
    return (control) => {
      if (control.value) {
        if (this.fieldsForm.value.find((element: {field: string}) => element.field == control.value) && control.dirty) {
          return { already: true, msg: "Field already selected" };
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
