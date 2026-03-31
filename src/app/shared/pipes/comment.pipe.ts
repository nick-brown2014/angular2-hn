import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'comment',
  standalone: false,
  pure: true
})
export class CommentPipe implements PipeTransform {
  transform(comment: number): string {
   if (comment > 0) {
     const st = comment === 1 ? 'comment' : 'comments';
     return `${comment} ${st}`;
   }
   return 'discuss';
  }
}
