import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { FuncionarioService } from './funcionario.service';
import { FuncionarioRequest } from './funcionario.model';

describe('FuncionarioService', () => {
  let service: FuncionarioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FuncionarioService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FuncionarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listar envia os filtros como query params', () => {
    service.listar({ nome: 'Ana' }).subscribe();
    const req = httpMock.expectOne(r => r.url === environment.apiUrl && r.params.get('nome') === 'Ana');
    req.flush({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 50 });
  });

  it('criar faz POST com o corpo correto', () => {
    const dados: FuncionarioRequest = { cpf: '12345678909', nome: 'Ana', email: 'ana@example.com', tamanhoCamiseta: 'M', tamanhoCalcado: 38 };
    service.criar(dados).subscribe();
    const req = httpMock.expectOne(environment.apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dados);
    req.flush({ id: 1, ...dados });
  });

  it('excluir faz DELETE no id informado', () => {
    service.excluir(1).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
