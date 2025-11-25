import { TestBed } from '@angular/core/testing';

import { ListaRepartidoresService } from './lista-repartidores.service';

describe('ListaRepartidoresService', () => {
  let service: ListaRepartidoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListaRepartidoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
