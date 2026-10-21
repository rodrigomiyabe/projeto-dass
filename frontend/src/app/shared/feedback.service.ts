import { Injectable, signal } from '@angular/core';

export interface Mensagem {
  texto: string;
  tipo: 'sucesso' | 'erro';
}

const DURACAO_MS = 5000;

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  readonly mensagem = signal<Mensagem | null>(null);

  sucesso(texto: string): void {
    this.definirMensagem({ texto, tipo: 'sucesso' });
  }

  erro(texto: string): void {
    this.definirMensagem({ texto, tipo: 'erro' });
  }

  private definirMensagem(mensagem: Mensagem): void {
    this.mensagem.set(mensagem);
    setTimeout(() => {
      if (this.mensagem() === mensagem) {
        this.mensagem.set(null);
      }
    }, DURACAO_MS);
  }
}
