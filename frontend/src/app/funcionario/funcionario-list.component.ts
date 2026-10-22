import {
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FeedbackService } from '../shared/feedback.service';
import { Funcionario, FuncionarioFiltro, TamanhoCamiseta } from './funcionario.model';
import { FuncionarioService } from './funcionario.service';

export const TAMANHOS_CAMISETA_FILTRO: TamanhoCamiseta[] = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

@Component({
  selector: 'app-funcionario-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './funcionario-list.component.html',
  styleUrl: './funcionario-list.component.scss',
})
export class FuncionarioListComponent implements OnInit {
  @Output() novoEvento = new EventEmitter<void>();
  @Output() editarEvento = new EventEmitter<Funcionario>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FuncionarioService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly tamanhosCamiseta = TAMANHOS_CAMISETA_FILTRO;

  readonly funcionarios = signal<Funcionario[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly paginaAtual = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);

  readonly listaVazia = computed(
    () => !this.carregando() && this.funcionarios().length === 0 && !this.erro(),
  );

  readonly temPaginaAnterior = computed(() => this.paginaAtual() > 0);
  readonly temProximaPagina = computed(() => this.paginaAtual() + 1 < this.totalPaginas());

  readonly filtro = this.fb.nonNullable.group({
    cpf: [''],
    nome: [''],
    email: [''],
    tamanhoCamiseta: [''],
    tamanhoCalcado: [null as unknown as number],
  });

  ngOnInit(): void {
    this.pesquisar();

    // Pesquisa reativa: qualquer alteração nos filtros (inclusive limpar um
    // campo) já atualiza a lista sozinha, sem precisar clicar em "Pesquisar"
    // de novo. O botão continua funcionando (Enter / clique) para quem
    // prefere disparar a busca explicitamente.
    this.filtro.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((anterior, atual) => JSON.stringify(anterior) === JSON.stringify(atual)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.pesquisar());
  }

  pesquisar(pagina = 0): void {
    const valores = this.filtro.getRawValue();
    const filtro: FuncionarioFiltro = {
      cpf: this.valorOuIndefinido(valores.cpf),
      nome: this.valorOuIndefinido(valores.nome),
      email: this.valorOuIndefinido(valores.email),
      tamanhoCamiseta: this.valorOuIndefinido(valores.tamanhoCamiseta) as TamanhoCamiseta | undefined,
      tamanhoCalcado: valores.tamanhoCalcado ?? undefined,
    };

    this.carregando.set(true);
    this.erro.set(null);

    this.service.listar(filtro, pagina).subscribe({
      next: (resultado) => {
        this.funcionarios.set(resultado.content);
        this.paginaAtual.set(resultado.number);
        this.totalPaginas.set(resultado.totalPages);
        this.totalElementos.set(resultado.totalElements);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os funcionários.');
        this.funcionarios.set([]);
        this.paginaAtual.set(0);
        this.totalPaginas.set(0);
        this.totalElementos.set(0);
        this.carregando.set(false);
      },
    });
  }

  paginaAnterior(): void {
    if (this.temPaginaAnterior()) {
      this.pesquisar(this.paginaAtual() - 1);
    }
  }

  proximaPagina(): void {
    if (this.temProximaPagina()) {
      this.pesquisar(this.paginaAtual() + 1);
    }
  }

  excluir(id: number): void {
    if (!window.confirm('Confirma a exclusão deste funcionário?')) {
      return;
    }

    this.service.excluir(id).subscribe({
      next: () => {
        this.feedbackService.sucesso('Funcionário excluído com sucesso.');
        this.pesquisar(this.paginaAtual());
      },
      error: () => {
        this.feedbackService.erro('Não foi possível excluir o funcionário.');
      },
    });
  }

  novo(): void {
    this.novoEvento.emit();
    this.router.navigate(['/novo']);
  }

  editar(funcionario: Funcionario): void {
    this.editarEvento.emit(funcionario);
    this.router.navigate(['/editar', funcionario.id]);
  }

  private valorOuIndefinido(valor: string | null | undefined): string | undefined {
    return valor === null || valor === undefined || valor === '' ? undefined : valor;
  }
}
