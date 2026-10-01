import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PseudocodePanel } from './pseudocode-panel';

describe('PseudocodePanel', () => {
  let component: PseudocodePanel;
  let fixture: ComponentFixture<PseudocodePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PseudocodePanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PseudocodePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
