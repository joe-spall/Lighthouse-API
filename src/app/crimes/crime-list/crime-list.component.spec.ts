import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrimeListComponent } from './crime-list.component';

describe('CrimeListComponent', () => {
  let component: CrimeListComponent;
  let fixture: ComponentFixture<CrimeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrimeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrimeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
