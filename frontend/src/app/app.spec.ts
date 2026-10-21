import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { FeedbackService } from './shared/feedback.service';
import { routes } from './app.routes';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let feedbackService: FeedbackService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    feedbackService = TestBed.inject(FeedbackService);
  });

  it('cria o componente', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('não exibe o toast quando não há mensagem de feedback', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-toast')).toBeNull();
  });

  it('exibe o toast de sucesso com a classe correspondente', () => {
    feedbackService.sucesso('Funcionário salvo com sucesso.');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const toast = compiled.querySelector('.app-toast');
    expect(toast?.textContent).toContain('Funcionário salvo com sucesso.');
    expect(toast?.classList.contains('app-toast--sucesso')).toBe(true);
    expect(toast?.classList.contains('app-toast--erro')).toBe(false);
  });

  it('exibe o toast de erro com a classe correspondente', () => {
    feedbackService.erro('Não foi possível salvar o funcionário.');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const toast = compiled.querySelector('.app-toast');
    expect(toast?.textContent).toContain('Não foi possível salvar o funcionário.');
    expect(toast?.classList.contains('app-toast--erro')).toBe(true);
    expect(toast?.classList.contains('app-toast--sucesso')).toBe(false);
  });

  it('renderiza o router-outlet', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});
