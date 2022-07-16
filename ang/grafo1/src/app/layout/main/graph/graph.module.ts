import { ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxGraphModule } from '@swimlane/ngx-graph';

import { CreateComponent } from './create/create.component';
import { EditComponent } from './edit/edit.component';
import { ViewComponent } from './view/view.component';
import { ListComponent } from './list/list.component';
import { SidebarEditComponent } from './edit/sidebar-edit/sidebar-edit.component';
import { ViewEditComponent } from './edit/view-edit/view-edit.component';
import { InjectNodeComponent } from './flow-nodes/inject-node/inject-node.component';
import { DebugNodeComponent } from './flow-nodes/debug-node/debug-node.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { StringOpsNodeComponent } from './flow-nodes/string-ops-node/string-ops-node.component';
import { FieldsDelNodeComponent } from './flow-nodes/fields-del-node/fields-del-node.component';
import { NodeBasicsComponent } from './node-basics/node-basics.component';


@NgModule({
  declarations: [
    CreateComponent,
    ListComponent,
    EditComponent,
    SidebarEditComponent,
    ViewEditComponent,
    ViewComponent,
    InjectNodeComponent,
    DebugNodeComponent,
    StringOpsNodeComponent,
    FieldsDelNodeComponent,
    NodeBasicsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgxGraphModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    NgbModule,
    MonacoEditorModule.forRoot()
  ],
  exports: [
    CreateComponent,
    ListComponent,
    EditComponent
  ]
})
export class GraphModule { }
