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
export class ListComponent implements OnInit {
  graph_deletions: {[i: string]: boolean} = {};
  graphs: Graph[] = [];
  loaded: boolean = false;

  constructor(private router: Router, private sp: SpringService) {
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
  }

  ngOnInit(): void {
  }

  getGraphs() {
    // return this.Graphs.graph$.getValue();
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

}

interface _Graph {
  id: number,
  graph: Graph
}
