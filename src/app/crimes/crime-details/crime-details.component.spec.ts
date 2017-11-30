import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrimeDetailsComponent } from './crime-details.component';

describe('CrimeDetailsComponent', () => {
  let component: CrimeDetailsComponent;
  let fixture: ComponentFixture<CrimeDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrimeDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrimeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
