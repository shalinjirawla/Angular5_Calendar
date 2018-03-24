import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CalendarService } from './calender.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private service: CalendarService,
    private r: Router) { }
  myForm: FormGroup;

  ngOnInit() {
    this.myForm = this.fb.group({
      Pin: ['']
    });
  }

  Login() {
    let pin = this.myForm.value.Pin;
    this.service.Login(pin).subscribe(response => {
      if (response != null) {
        localStorage.setItem('loginuser', response.Id);
        this.r.navigate(['Home']);
      }
      else {
        alert('wrong pin, please enter correct pin');
      }

    });
  }
}
