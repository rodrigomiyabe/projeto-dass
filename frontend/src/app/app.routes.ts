import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { FuncionarioFormComponent } from './funcionario/funcionario-form.component';
import { FuncionarioListComponent } from './funcionario/funcionario-list.component';
import { Funcionario } from './funcionario/funcionario.model';
import { FuncionarioService } from './funcionario/funcionario.service';

export const funcionarioResolver: ResolveFn<Funcionario> = (route: ActivatedRouteSnapshot) => {
  const service = inject(FuncionarioService);
  const id = Number(route.paramMap.get('id'));
  return service.buscarPorId(id);
};

export const routes: Routes = [
  { path: '', component: FuncionarioListComponent },
  { path: 'novo', component: FuncionarioFormComponent },
  {
    path: 'editar/:id',
    component: FuncionarioFormComponent,
    resolve: { funcionario: funcionarioResolver },
  },
];
