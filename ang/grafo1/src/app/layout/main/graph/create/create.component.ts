import { GraphEditingService, Node, Edge } from '../graph-editing.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ClusterNode } from '@swimlane/ngx-graph';
import { SpringService } from 'src/app/shared/services/spring.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  isCreated: boolean;

  editGraphForm: FormGroup;
  @Output() updateGraphView = new EventEmitter<number>();
  @Input() selectedNode?: Node;
  @Input() selectedEdge?: Edge;
  @Input() selectedCluster?: ClusterNode;
  @Input() forcedChange: any;

  graphNameAlready: boolean = false;
  graphSearching: boolean = false;

  Object = Object;

  constructor(public graphEditingService: GraphEditingService, private formBuilder: FormBuilder, private router: Router, private sp: SpringService) {
    this.isCreated = false;
    this.graphEditingService.clearGraph(); //preparo un grafo vuoto

    this.editGraphForm = this.formBuilder.group({
      graph_name: ["", Validators.required],
      graph_desc: ["", Validators.required]
    });
  }

  ngOnInit(): void {
  }

  getSidebarHeight(): string {
    const header_height: number | undefined = document.getElementsByTagName("app-header")[0].firstElementChild?.clientHeight || 67;
    const viewport_height: number | undefined = window.innerHeight || 290;
    return (viewport_height - header_height).toString() + "px";
  }

  checkGraphName() {
    this.graphSearching = true;
    let new_name = this.editGraphForm.controls["graph_name"].value;
    let old_name = this.graphEditingService.graph.name;
    if (new_name != old_name && new_name != "") {
      this.sp.checkGraphExists(new_name).subscribe((found) => {
        this.graphNameAlready = found;
        this.graphSearching = false;
      })
    }
  }

  tryCreate() {
    if (this.editGraphForm.controls["graph_name"].valid) {
      let graph_name = this.editGraphForm.controls["graph_name"].value;
      let graph_desc = this.editGraphForm.controls["graph_desc"].value;
      this.graphEditingService.createGraph(graph_name, graph_desc);
      this.graphEditingService.saveGraphInStorage();
      // let key = -1;
      // for (let i = 0; i < localStorage.length; i++) {
      //   const element = localStorage.key(i);
      //   if (element == graph_name) key = i;
      // }
      // if (key != -1)
      this.router.navigate(["/app/graph/edit/"+graph_name]);
    }
  }
}
