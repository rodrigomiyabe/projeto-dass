import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let service: ConfirmDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    service = TestBed.inject(ConfirmDialogService);
  });

  it('não renderiza nada quando não há diálogo pendente', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.confirm-dialog')).toBeNull();
  });

  it('exibe a mensagem quando há um diálogo pendente', () => {
    service.confirmar('Confirma a exclusão deste funcionário?');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.confirm-dialog__mensagem').textContent).toContain(
      'Confirma a exclusão deste funcionário?',
    );
  });

  it('clicar em confirmar resolve a promise com true e some com o diálogo', async () => {
    const promessa = service.confirmar('Confirma?');
    fixture.detectChanges();

    const botaoConfirmar = fixture.nativeElement.querySelector('.botao--perigo') as HTMLButtonElement;
    botaoConfirmar.click();
    fixture.detectChanges();

    await expect(promessa).resolves.toBe(true);
    expect(fixture.nativeElement.querySelector('.confirm-dialog')).toBeNull();
  });

  it('clicar em cancelar resolve a promise com false', async () => {
    const promessa = service.confirmar('Confirma?');
    fixture.detectChanges();

    const botaoCancelar = fixture.nativeElement.querySelector('.botao--ghost') as HTMLButtonElement;
    botaoCancelar.click();
    fixture.detectChanges();

    await expect(promessa).resolves.toBe(false);
  });
});
