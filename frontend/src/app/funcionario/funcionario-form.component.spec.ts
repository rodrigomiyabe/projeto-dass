import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FuncionarioFormComponent } from './funcionario-form.component';
import { FuncionarioService } from './funcionario.service';
import { Funcionario } from './funcionario.model';
import { FeedbackService } from '../shared/feedback.service';

describe('FuncionarioFormComponent', () => {
  let fixture: ComponentFixture<FuncionarioFormComponent>;
  let component: FuncionarioFormComponent;
  let service: { criar: jest.Mock; atualizar: jest.Mock };
  let feedback: { sucesso: jest.Mock; erro: jest.Mock };
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    service = { criar: jest.fn(), atualizar: jest.fn() };
    feedback = { sucesso: jest.fn(), erro: jest.fn() };
    router = { navigate: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [FuncionarioFormComponent, ReactiveFormsModule],
      providers: [
        { provide: FuncionarioService, useValue: service },
        { provide: FeedbackService, useValue: feedback },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FuncionarioFormComponent);
    component = fixture.componentInstance;
  });

  it('marca cpf inválido como inválido no formulário', () => {
    component.form.controls['cpf'].setValue('11111111111');
    expect(component.form.controls['cpf'].valid).toBe(false);
  });

  it('marca nome em branco ou muito curto como inválido', () => {
    component.form.controls['nome'].setValue('   ');
    expect(component.form.controls['nome'].valid).toBe(false);
    component.form.controls['nome'].setValue('A');
    expect(component.form.controls['nome'].valid).toBe(false);
    component.form.controls['nome'].setValue('Ana');
    expect(component.form.controls['nome'].valid).toBe(true);
  });

  it('marca email em branco ou maior que 150 caracteres como inválido', () => {
    component.form.controls['email'].setValue('   ');
    expect(component.form.controls['email'].valid).toBe(false);
    component.form.controls['email'].setValue(`${'a'.repeat(145)}@ex.com`);
    expect(component.form.controls['email'].valid).toBe(false);
  });

  it('marca calçado fora da faixa 34-48 como inválido', () => {
    component.form.controls['tamanhoCalcado'].setValue(33);
    expect(component.form.controls['tamanhoCalcado'].valid).toBe(false);
    component.form.controls['tamanhoCalcado'].setValue(49);
    expect(component.form.controls['tamanhoCalcado'].valid).toBe(false);
  });

  it('ao submeter um formulário válido em modo criação, chama service.criar, navega para / e emite salvo', () => {
    service.criar.mockReturnValue(of({ id: 1 } as Funcionario));
    const emitSpy = jest.spyOn(component.salvo, 'emit');
    component.form.setValue({
      cpf: '123.456.789-09',
      nome: 'Ana Silva',
      email: 'ana@example.com',
      tamanhoCamiseta: 'M',
      tamanhoCalcado: 38,
    });
    component.salvar();
    expect(service.criar).toHaveBeenCalled();
    expect(feedback.sucesso).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(emitSpy).toHaveBeenCalled();
  });

  it('ao falhar com 409, exibe a mensagem do backend e não navega', () => {
    service.criar.mockReturnValue(
      throwError(() => ({
        error: {
          timestamp: '2026-10-21T10:00:00-03:00',
          status: 409,
          error: 'Conflict',
          message: 'Já existe um funcionário cadastrado com o CPF informado',
          path: '/api/funcionarios',
          fieldErrors: [],
        },
      })),
    );
    component.form.setValue({
      cpf: '123.456.789-09',
      nome: 'Ana Silva',
      email: 'ana@example.com',
      tamanhoCamiseta: 'M',
      tamanhoCalcado: 38,
    });
    component.salvar();
    expect(component.erro()).toBe('Já existe um funcionário cadastrado com o CPF informado');
    expect(feedback.erro).toHaveBeenCalledWith('Já existe um funcionário cadastrado com o CPF informado');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('ao falhar com 400 e fieldErrors, exibe a mensagem combinando os erros de campo', () => {
    service.criar.mockReturnValue(
      throwError(() => ({
        error: {
          timestamp: '2026-10-21T10:00:00-03:00',
          status: 400,
          error: 'Bad Request',
          message: 'Dados inválidos',
          path: '/api/funcionarios',
          fieldErrors: [{ campo: 'cpf', mensagem: 'CPF inválido' }],
        },
      })),
    );
    component.form.setValue({
      cpf: '123.456.789-09',
      nome: 'Ana Silva',
      email: 'ana@example.com',
      tamanhoCamiseta: 'M',
      tamanhoCalcado: 38,
    });
    component.salvar();
    expect(component.erro()).toContain('cpf: CPF inválido');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('cancelar navega para / e emite cancelado sem chamar o serviço', () => {
    const emitSpy = jest.spyOn(component.cancelado, 'emit');
    component.cancelar();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(emitSpy).toHaveBeenCalled();
    expect(service.criar).not.toHaveBeenCalled();
    expect(service.atualizar).not.toHaveBeenCalled();
  });
});
