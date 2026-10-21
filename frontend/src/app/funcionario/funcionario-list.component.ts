import { Component, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  readonly tamanhosCamiseta = TAMANHOS_CAMISETA_FILTRO;

  readonly funcionarios = signal<Funcionario[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly listaVazia = computed(
    () => !this.carregando() && this.funcionarios().length === 0 && !this.erro(),
  );

  readonly filtro = this.fb.nonNullable.group({
    cpf: [''],
    nome: [''],
    email: [''],
    tamanhoCamiseta: [''],
    tamanhoCalcado: [null as unknown as number],
  });

  ngOnInit(): void {
    this.pesquisar();
  }

  pesquisar(): void {
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

    this.service.listar(filtro).subscribe({
      next: (pagina) => {
        this.funcionarios.set(pagina.content);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os funcionários.');
        this.funcionarios.set([]);
        this.carregando.set(false);
      },
    });
  }

  excluir(id: number): void {
    if (!window.confirm('Confirma a exclusão deste funcionário?')) {
      return;
    }

    this.service.excluir(id).subscribe(() => {
      this.feedbackService.sucesso('Funcionário excluído com sucesso.');
      this.pesquisar();
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
