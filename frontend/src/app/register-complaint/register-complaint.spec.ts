import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComplaint } from './register-complaint';

describe('RegisterComplaint', () => {
  let component: RegisterComplaint;
  let fixture: ComponentFixture<RegisterComplaint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComplaint],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComplaint);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
