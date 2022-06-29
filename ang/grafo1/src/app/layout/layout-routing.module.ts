import { ViewComponent } from './main/graph/view/view.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentComponent } from './content/content.component';
import { CreateComponent } from './main/graph/create/create.component';
import { ListComponent } from './main/graph/list/list.component';
import { EditComponent } from './main/graph/edit/edit.component';

const routes: Routes = [
  {path: "graph", component: ContentComponent, children: [
    {path: "list", component: ListComponent},
    {path: "create", component: CreateComponent, data: {footer: false}},
    {path: "view/:graph_id", component: ViewComponent},
    {path: "edit/:graph_id", component: EditComponent},
    {path: "", redirectTo: "list"}
  ]},
  {path: "", redirectTo: "graph"}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
