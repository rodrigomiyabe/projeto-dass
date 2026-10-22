import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogState {
  mensagem: string;
  textoConfirmar: string;
  textoCancelar: string;
}

/**
 * Substitui o `window.confirm()` nativo por um modal próprio da aplicação.
 * `confirmar()` resolve a promise quando o usuário responde pelo
 * `ConfirmDialogComponent` (montado uma única vez no shell da aplicação).
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly estado = signal<ConfirmDialogState | null>(null);

  private resolver: ((confirmado: boolean) => void) | null = null;

  confirmar(mensagem: string, textoConfirmar = 'Excluir', textoCancelar = 'Cancelar'): Promise<boolean> {
    this.estado.set({ mensagem, textoConfirmar, textoCancelar });
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  responder(confirmado: boolean): void {
    const resolver = this.resolver;
    this.estado.set(null);
    this.resolver = null;
    resolver?.(confirmado);
  }
}
