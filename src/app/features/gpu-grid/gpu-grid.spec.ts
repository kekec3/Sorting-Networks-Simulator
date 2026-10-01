import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpuGrid } from './gpu-grid';

describe('GpuGrid', () => {
  let component: GpuGrid;
  let fixture: ComponentFixture<GpuGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GpuGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GpuGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
