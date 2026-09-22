import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './loader/loader.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { ItemComponent } from '../../feeds/item/item.component';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [CommonModule, RouterModule, PipesModule],
  declarations: [ LoaderComponent, ErrorMessageComponent, ItemComponent ],
  exports: [ LoaderComponent, ErrorMessageComponent, ItemComponent ]
})
export class SharedComponentsModule {}
