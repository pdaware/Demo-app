import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '../../utlity/services/common-service.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup

  constructor(
    private fb: FormBuilder,
    private cs: CommonServiceService,
    public router: Router,
    private toster: ToastrService
  ) {

  }


  ngOnInit(): void {
    this.createLoginForm()
  }

  createLoginForm() {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onClickSubmit() {
    if (this.loginForm.valid) {
      if (this.loginForm.controls['userName'].value === this.cs.userName && this.loginForm.controls['password'].value === this.cs.password) {
        this.cs.isUserLogIn = true;
        this.toster.success('Login Sucessfully', '', { timeOut: 3000, positionClass: 'toast-bottom-center', enableHtml: true });
        this.router.navigateByUrl('/product-detail')

      } else {
        this.toster.error('User Name or Password is incorrect', 'Error', {
          timeOut: 3000, positionClass: 'toast-bottom-center', progressBar: true,
          closeButton: true,
          onActivateTick: true, enableHtml: true
        });
        // this.router.navigateByUrl('/product-detail');
      }
    }
  }


}
