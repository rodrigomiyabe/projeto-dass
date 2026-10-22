import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Route, Router, Routes } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FuncionarioFormComponent } from './funcionario/funcionario-form.component';
import { FuncionarioListComponent } from './funcionario/funcionario-list.component';
import { Funcionario } from './funcionario/funcionario.model';
import { FuncionarioService } from './funcionario/funcionario.service';
import { FeedbackService } from './shared/feedback.service';
import { funcionarioResolver, routes } from './app.routes';

async function loadRouteComponent(allRoutes: Routes, path: string): Promise<unknown> {
  const route = allRoutes.find((r: Route) => r.path === path);
  if (!route) {
    throw new Error(`Rota '${path}' não encontrada`);
  }
  return route.component;
}

describe('app.routes', () => {
  it('rota novo carrega FuncionarioFormComponent em modo criação', async () => {
    const component = await loadRouteComponent(routes, 'novo');
    expect(component).toBe(FuncionarioFormComponent);
  });

  it('rota vazia carrega FuncionarioListComponent', async () => {
    const component = await loadRouteComponent(routes, '');
    expect(component).toBe(FuncionarioListComponent);
  });

  it('rota editar/:id carrega FuncionarioFormComponent com resolver funcionario', async () => {
    const route = routes.find((r: Route) => r.path === 'editar/:id');
    expect(route?.component).toBe(FuncionarioFormComponent);
    expect(route?.resolve).toBeDefined();
    expect(route?.resolve?.['funcionario']).toBeDefined();
  });
});

describe('funcionarioResolver', () => {
  let service: { buscarPorId: jest.Mock };
  let feedback: { erro: jest.Mock };
  let router: { navigate: jest.Mock };

  const snapshotComId = (id: string) =>
    ({ paramMap: convertToParamMap({ id }) }) as ActivatedRouteSnapshot;

  beforeEach(() => {
    service = { buscarPorId: jest.fn() };
    feedback = { erro: jest.fn() };
    router = { navigate: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: FuncionarioService, useValue: service },
        { provide: FeedbackService, useValue: feedback },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('retorna o funcionário quando a busca é bem-sucedida', (done) => {
    const funcionario = { id: 1, cpf: '12345678909', nome: 'Ana', email: 'ana@example.com', tamanhoCamiseta: 'M', tamanhoCalcado: 38 } as Funcionario;
    service.buscarPorId.mockReturnValue(of(funcionario));

    TestBed.runInInjectionContext(() => {
      const resultado = funcionarioResolver(snapshotComId('1'), {} as any);
      (resultado as any).subscribe((valor: Funcionario) => {
        expect(valor).toEqual(funcionario);
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      });
    });
  });

  it('mostra feedback de erro e navega para / quando a busca falha', (done) => {
    service.buscarPorId.mockReturnValue(throwError(() => new Error('não encontrado')));

    TestBed.runInInjectionContext(() => {
      const resultado = funcionarioResolver(snapshotComId('999'), {} as any);
      (resultado as any).subscribe({
        complete: () => {
          expect(feedback.erro).toHaveBeenCalled();
          expect(router.navigate).toHaveBeenCalledWith(['/']);
          done();
        },
      });
    });
  });
});
