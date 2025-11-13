import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { tipoUsuarioGuard } from './tipo-usuario-guard';

describe('tipoUsuarioGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => tipoUsuarioGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
