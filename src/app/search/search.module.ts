import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from './search.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';

const routes: Routes = [
  { path: '', component: SearchComponent },
  { path: ':page', component: SearchComponent }
];

@NgModule({
  imports: [CommonModule, FormsModule, SharedComponentsModule, RouterModule.forChild(routes)],
  declarations: [SearchComponent],
  exports: [SearchComponent, RouterModule]
})
export class SearchModule {}
