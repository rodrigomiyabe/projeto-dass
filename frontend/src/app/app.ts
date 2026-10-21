import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackService } from './shared/feedback.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly feedbackService = inject(FeedbackService);
}
