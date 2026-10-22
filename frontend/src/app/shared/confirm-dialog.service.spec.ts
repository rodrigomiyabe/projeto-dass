import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmDialogService);
  });

  it('confirmar define o estado com a mensagem e os textos padrão', () => {
    service.confirmar('Confirma a exclusão deste funcionário?');
    expect(service.estado()).toEqual({
      mensagem: 'Confirma a exclusão deste funcionário?',
      textoConfirmar: 'Excluir',
      textoCancelar: 'Cancelar',
    });
  });

  it('responder(true) resolve a promise com true e limpa o estado', async () => {
    const promessa = service.confirmar('Confirma?');
    service.responder(true);
    await expect(promessa).resolves.toBe(true);
    expect(service.estado()).toBeNull();
  });

  it('responder(false) resolve a promise com false e limpa o estado', async () => {
    const promessa = service.confirmar('Confirma?');
    service.responder(false);
    await expect(promessa).resolves.toBe(false);
    expect(service.estado()).toBeNull();
  });
});
