import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Graph } from '../graph-editing.service';
import { HighlightSpanKind } from 'typescript';
import { SpringService } from 'src/app/shared/services/spring.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  graph_deletions: {[i: string]: boolean} = {};
  graphs: Graph[] = [];
  loaded: boolean = false;
  searchForm: FormGroup;

  constructor(private router: Router, private sp: SpringService, private fb: FormBuilder) {
    this.makeList();
    // for (let index = 0; index < localStorage.length; index++) {
    //   this.graphs.push(
    //     {
    //       id: index+1,
    //       graph: JSON.parse(localStorage.getItem(localStorage.key(index)||"")||"")
    //     }
    //   );
    //   this.graph_deletions[index+1] = false;
    // }
    this.searchForm = this.fb.group({
      input: null,
    });
  }


  public get search_input(): string {
    return this.searchForm.controls["input"].value;
  }


  getGraphs(): Graph[] {
    // return this.Graphs.graph$.getValue();
    if (this.search_input) { // Se stiamo cercando
      const by_names = this.graphs.filter(x => x.name.includes(this.search_input));
      const by_description = this.graphs.filter(x => x.description.includes(this.search_input));
      return by_names.concat(by_description);
    }
    return this.graphs;
  }

  makeList() {
    this.graphs = [];
    this.loaded = false;
    this.sp.getAll().subscribe(graphs => {
      graphs.forEach(graph => {
        this.graphs.push(graph);
        this.graph_deletions[graph.name] = false;
      });
      this.graphs = this.graphs.sort((a, b) => (a.date > b.date) ? -1 : 1);
      this.loaded = true;
    });
  }

  editGraph(name: string) {
    this.router.navigate(["/app/graph/edit/"+name]);
  }

  deleteGraph(graph_name: string) {
    this.sp.delete(graph_name).subscribe(() => {
      // location.reload();
      this.makeList();
    })
  }

  confirm_delete(graph_name: string) {
    if (!this.graph_deletions[graph_name]) {
      this.graph_deletions[graph_name] = true;
    } else {
      this.graph_deletions[graph_name] = false;
    }
  }

  getSearchBoxWidth(): string {
    let width: number|undefined = document.getElementById("search-box")?.clientWidth;
    if (width== undefined) {
      return "200px";
    } else {
      return (width - 50).toString() + "px";
    }
  }
}

interface _Graph {
  id: number,
  graph: Graph
}
