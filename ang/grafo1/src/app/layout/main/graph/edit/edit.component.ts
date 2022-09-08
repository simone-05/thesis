import { GraphEditingService } from '../graph-editing.service';
import { Component, OnDestroy, OnInit, AfterViewInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FuncManagerService } from 'src/app/shared/services/func-manager.service';
import { Subscription } from 'rxjs';
import _ from 'lodash';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, OnDestroy {
  graph_switch = 0;
  sidebar_switch = 0;
  graph_id = "";
  selectedNode: any;
  selectedEdge: any;

  graph_subscription: Subscription;

  constructor(private activatedRoute: ActivatedRoute, private graphEditingService: GraphEditingService, private fm: FuncManagerService) {

    this.graph_id = this.activatedRoute.snapshot.params['graph_id'];
    this.graphEditingService.loadGraph(this.graph_id);
    this.fm.clear_metrics().subscribe();

    // Quando ha finito di caricare il grafo
    this.graph_subscription = this.graphEditingService.graph$.subscribe(element => {
      if (this.graphEditingService.loaded$.value) {
          // Esegue solo se il grafo è caricato, per evitare di mandare un grafo vecchio
          this.fm.updateGraph(this.graphEditingService.graph).subscribe(x => console.log);
        }
      });
  }

  ngOnInit() {
    // this.switcher(1);z
    this.fm.connect();
  }

  ngOnDestroy() {
    this.graph_subscription.unsubscribe();
    this.fm.disconnect();
  }

  switcher(x: number) {
    this.graph_switch = x;
    setTimeout(() => {
      this.graph_switch = 0;
    }, 100);
  }

  nodeIsSelected(node: any) {
    this.selectedNode = node;
    this.sidebar_switch = 1;
    setTimeout(() => {
      this.sidebar_switch = 0;
    }, 100);
  }

  edgeIsSelected(edge: any) {
    this.selectedEdge = edge;
    this.sidebar_switch = 2;
    setTimeout(() => {
      this.sidebar_switch = 0;
    }, 100);
  }
}
