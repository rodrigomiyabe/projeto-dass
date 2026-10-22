import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Funcionario, FuncionarioFiltro, FuncionarioRequest, PaginaFuncionarios } from './funcionario.model';

@Injectable({ providedIn: 'root' })
export class FuncionarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listar(filtro: FuncionarioFiltro, pagina = 0): Observable<PaginaFuncionarios> {
    let params = new HttpParams();
    for (const [chave, valor] of Object.entries(filtro)) {
      if (valor !== undefined) {
        params = params.set(chave, valor);
      }
    }
    params = params.set('page', pagina);
    return this.http.get<PaginaFuncionarios>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.apiUrl}/${id}`);
  }

  criar(dados: FuncionarioRequest): Observable<Funcionario> {
    return this.http.post<Funcionario>(this.apiUrl, dados);
  }

  atualizar(id: number, dados: FuncionarioRequest): Observable<Funcionario> {
    return this.http.put<Funcionario>(`${this.apiUrl}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
