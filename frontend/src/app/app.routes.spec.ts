import { Route, Routes } from '@angular/router';
import { FuncionarioFormComponent } from './funcionario/funcionario-form.component';
import { FuncionarioListComponent } from './funcionario/funcionario-list.component';
import { routes } from './app.routes';

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
