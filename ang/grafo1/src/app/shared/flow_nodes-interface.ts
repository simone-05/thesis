// import { GraphEditingService} from './../layout/main/graph/graph-editing.service';
// import { Subject } from "rxjs/internal/Subject";
// import { BehaviorSubject } from 'rxjs';
import { Node } from "../layout/main/graph/graph-editing.service";
import _ from 'lodash';

export abstract class FlowNode implements Node {
  id: string;
  label: string;
  type: string;
  properties: any[string];

  input?: any;
  output?: any;
  content?: any;
  // inputTrigger$?: Subject<any>;
  // processInput(input: any): any {};

  constructor (id: string, label: string, type: string, props: any[string]/*, private gs?: GraphEditingService*/) {
    this.id = id;
    this.label = label;
    this.type = type;
    this.properties = props;
    // this.inputTrigger$ = new Subject();
    // this.inputTrigger$.subscribe((input) => this.processInput(input));
  }

  // sendOutput(output: any) {
  //   if (!this.gs) return;
  //   let out_nodes = this.gs.getOutNodes(this.id);

  //   out_nodes.forEach(element => {
  //     if (_.has(element, "inputTrigger$")){ //eseguo solo sui flownodes
  //       element.inputTrigger$.next(this.output);
  //       // element.input = this.output;
  //       // element.processInput();
  //     }
  //   });
  // }
}

export class DebugNode extends FlowNode {

  constructor (id: string, label: string, props: any[string]) {
    super(id, label, "debug", props);
    this.input = "";
  }

  // processInput(input: any) {
  //   console.log(input);
  //   // console.log(this.input);
  // }
}

export class InjectNode extends FlowNode {

  constructor (id: string, label: string, props: any[string], content: string/*, gs: GraphEditingService*/) {
    super(id, label, "inject", props/*, gs*/);
    this.output = "";
    this.content = content;
    // this.inputTrigger$ = undefined;
  }

  // processInput() {
  //   this.output = this.content;
  //   super.sendOutput(this.output);
  // }

}

export class FooNode extends FlowNode {

  constructor(id: string, label: string, props: any[string]/*, gs: GraphEditingService*/) {
    super(id, label, "foo", props/*, gs*/);
    this.input = "";
    this.output = "";
  }

  // Aggiunge 10 ad "age"
  // processInput(input: any) {
  //   let x = JSON.parse(input);
  //   x.age += 10;
  //   this.output = x;
  //   this.sendOutput(this.output);
  // }
}
