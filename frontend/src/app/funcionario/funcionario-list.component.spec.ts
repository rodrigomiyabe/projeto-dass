import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FuncionarioListComponent } from './funcionario-list.component';
import { FuncionarioService } from './funcionario.service';
import { Funcionario, PaginaFuncionarios } from './funcionario.model';
import { FeedbackService } from '../shared/feedback.service';

describe('FuncionarioListComponent', () => {
  let fixture: ComponentFixture<FuncionarioListComponent>;
  let component: FuncionarioListComponent;
  let service: { listar: jest.Mock; excluir: jest.Mock };
  let feedback: { sucesso: jest.Mock; erro: jest.Mock };
  let router: { navigate: jest.Mock };

  const pagina = (content: Funcionario[]): PaginaFuncionarios => ({
    content,
    totalElements: content.length,
    totalPages: 1,
    number: 0,
    size: 50,
  });

  beforeEach(async () => {
    service = { listar: jest.fn(), excluir: jest.fn() };
    feedback = { sucesso: jest.fn(), erro: jest.fn() };
    router = { navigate: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [FuncionarioListComponent],
      providers: [
        { provide: FuncionarioService, useValue: service },
        { provide: FeedbackService, useValue: feedback },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FuncionarioListComponent);
    component = fixture.componentInstance;
  });

  it('carrega e exibe a lista ao iniciar', () => {
    service.listar.mockReturnValue(
      of(pagina([{ id: 1, cpf: '12345678909', nome: 'Ana', email: 'ana@example.com', tamanhoCamiseta: 'M', tamanhoCalcado: 38 }])),
    );
    fixture.detectChanges();
    expect(component.funcionarios().length).toBe(1);
  });

  it('exibe estado vazio quando não há resultados', () => {
    service.listar.mockReturnValue(of(pagina([])));
    fixture.detectChanges();
    expect(component.listaVazia()).toBe(true);
  });

  it('exibe estado de erro quando a API falha', () => {
    service.listar.mockReturnValue(throwError(() => new Error('falha')));
    fixture.detectChanges();
    expect(component.erro()).toBeTruthy();
  });

  it('pesquisar chama service.listar com os filtros preenchidos', () => {
    service.listar.mockReturnValue(of(pagina([])));
    fixture.detectChanges();
    component.filtro.controls['nome'].setValue('Ana');
    component.pesquisar();
    expect(service.listar).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Ana' }));
  });

  it('excluir só chama o serviço após confirmação, navega e mostra feedback de sucesso', () => {
    service.listar.mockReturnValue(
      of(pagina([{ id: 1, cpf: '12345678909', nome: 'Ana', email: 'ana@example.com', tamanhoCamiseta: 'M', tamanhoCalcado: 38 }])),
    );
    service.excluir.mockReturnValue(of(void 0));
    fixture.detectChanges();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    component.excluir(1);
    expect(service.excluir).not.toHaveBeenCalled();
    confirmSpy.mockReturnValue(true);
    component.excluir(1);
    expect(service.excluir).toHaveBeenCalledWith(1);
    expect(feedback.sucesso).toHaveBeenCalled();
  });

  it('novo navega para /novo e editar navega para /editar/:id', () => {
    service.listar.mockReturnValue(
      of(pagina([{ id: 7, cpf: '12345678909', nome: 'Ana', email: 'ana@example.com', tamanhoCamiseta: 'M', tamanhoCalcado: 38 }])),
    );
    fixture.detectChanges();
    component.novo();
    expect(router.navigate).toHaveBeenCalledWith(['/novo']);
    component.editar(component.funcionarios()[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/editar', 7]);
  });
});
