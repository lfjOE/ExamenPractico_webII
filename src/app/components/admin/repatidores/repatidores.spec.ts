import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Repatidores } from './repatidores';

describe('Repatidores', () => {
  let component: Repatidores;
  let fixture: ComponentFixture<Repatidores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Repatidores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Repatidores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
