import { Injectable } from '@angular/core';

export type View = 'catalogo' | 'login' | 'signup' | 'forgot-password';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  private _view: View = 'catalogo';
  setView(v: View) { this._view = v; }
  getView(): View { return this._view; }
}
