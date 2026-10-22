import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  protected readonly confirmDialogService = inject(ConfirmDialogService);

  confirmar(): void {
    this.confirmDialogService.responder(true);
  }

  cancelar(): void {
    this.confirmDialogService.responder(false);
  }
}
