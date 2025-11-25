import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaRepartidores } from './lista-repartidores';

describe('ListaRepartidores', () => {
  let component: ListaRepartidores;
  let fixture: ComponentFixture<ListaRepartidores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaRepartidores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaRepartidores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
