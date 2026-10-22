import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { Routes } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FuncionarioFormComponent } from './funcionario/funcionario-form.component';
import { FuncionarioListComponent } from './funcionario/funcionario-list.component';
import { Funcionario } from './funcionario/funcionario.model';
import { FuncionarioService } from './funcionario/funcionario.service';
import { FeedbackService } from './shared/feedback.service';

export const funcionarioResolver: ResolveFn<Funcionario> = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
) => {
  const service = inject(FuncionarioService);
  const feedbackService = inject(FeedbackService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return service.buscarPorId(id).pipe(
    catchError(() => {
      feedbackService.erro('Não foi possível carregar o funcionário solicitado.');
      router.navigate(['/']);
      return EMPTY;
    }),
  );
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
