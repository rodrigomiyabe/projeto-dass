import { TestBed } from '@angular/core/testing';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedbackService);
  });

  it('sucesso define a mensagem com tipo sucesso', () => {
    service.sucesso('Funcionário salvo com sucesso.');
    expect(service.mensagem()).toEqual({ texto: 'Funcionário salvo com sucesso.', tipo: 'sucesso' });
  });

  it('erro define a mensagem com tipo erro', () => {
    service.erro('Falha ao salvar.');
    expect(service.mensagem()).toEqual({ texto: 'Falha ao salvar.', tipo: 'erro' });
  });
});
