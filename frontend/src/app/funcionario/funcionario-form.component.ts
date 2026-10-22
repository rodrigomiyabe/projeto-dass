import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiError } from '../shared/api-error.model';
import { cpfValidator, normalizarCpf } from '../shared/cpf-validator';
import { FeedbackService } from '../shared/feedback.service';
import { Funcionario, FuncionarioRequest, TamanhoCamiseta } from './funcionario.model';
import { FuncionarioService } from './funcionario.service';

const NAO_EM_BRANCO = Validators.pattern(/\S/);

export const TAMANHOS_CAMISETA: TamanhoCamiseta[] = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

@Component({
  selector: 'app-funcionario-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './funcionario-form.component.html',
  styleUrl: './funcionario-form.component.scss',
})
export class FuncionarioFormComponent implements OnInit {
  @Input() funcionario?: Funcionario;
  @Output() salvo = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FuncionarioService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  readonly tamanhosCamiseta = TAMANHOS_CAMISETA;
  readonly erro = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    cpf: ['', [Validators.required, cpfValidator()]],
    nome: ['', [Validators.required, NAO_EM_BRANCO, Validators.minLength(2), Validators.maxLength(150)]],
    email: ['', [Validators.required, NAO_EM_BRANCO, Validators.email, Validators.maxLength(150)]],
    tamanhoCamiseta: ['' as TamanhoCamiseta, [Validators.required]],
    tamanhoCalcado: [null as unknown as number, [Validators.required, Validators.min(34), Validators.max(48)]],
  });

  ngOnInit(): void {
    if (this.funcionario) {
      this.form.patchValue({
        cpf: this.funcionario.cpf,
        nome: this.funcionario.nome,
        email: this.funcionario.email,
        tamanhoCamiseta: this.funcionario.tamanhoCamiseta,
        tamanhoCalcado: this.funcionario.tamanhoCalcado,
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const dados: FuncionarioRequest = {
      cpf: normalizarCpf(valores.cpf),
      nome: valores.nome,
      email: valores.email,
      tamanhoCamiseta: valores.tamanhoCamiseta,
      tamanhoCalcado: valores.tamanhoCalcado,
    };

    const requisicao = this.funcionario
      ? this.service.atualizar(this.funcionario.id, dados)
      : this.service.criar(dados);

    requisicao.subscribe({
      next: () => {
        this.erro.set(null);
        this.feedbackService.sucesso('Funcionário salvo com sucesso.');
        this.router.navigate(['/']);
        this.salvo.emit();
      },
      error: (err: { error?: ApiError }) => {
        const mensagem = this.extrairMensagemDeErro(err?.error);
        this.erro.set(mensagem);
        this.feedbackService.erro(mensagem);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/']);
    this.cancelado.emit();
  }

  private extrairMensagemDeErro(apiError: ApiError | undefined): string {
    const padrao = 'Não foi possível salvar o funcionário. Verifique os dados e tente novamente.';

    if (apiError?.fieldErrors?.length) {
      const detalhes = apiError.fieldErrors.map((fe) => `${fe.campo}: ${fe.mensagem}`).join(' | ');
      return `${apiError.message ?? 'Dados inválidos'} (${detalhes})`;
    }

    return apiError?.message ?? padrao;
  }
}
