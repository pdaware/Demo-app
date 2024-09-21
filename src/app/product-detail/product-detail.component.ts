import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonServiceService } from 'src/utlity/services/common-service.service';

interface Product {
  Id: string;
  Code: string;
  Rate: number;
  Quantity: number;
  Value: number;
}

interface ResObj {
  Name: string;
  Date: string;
  Mobile: string;
  Email: string;
  TotalQuantity: number;
  TotalValue: number;
  Discount: number;
  InvoiceAmount: number;
  Products: Product[];
}

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})


export class ProductDetailComponent implements OnInit {
  productsArray: any[] = [];
  productForm!: FormGroup
  sendData: any;
  submitted: boolean = false;
  userName: string = ''



  constructor(
    private http: HttpClient,
    public cs: CommonServiceService,
    private fb: FormBuilder,
    private route: Router
  ) {
  }

  ngOnInit(): void {
    this.userName = this.cs.userName
    this.createProductForm()
    this.http.get<any>('../assets/json/products.json')
      .subscribe(data => {
        this.productsArray = data.data;
        // console.log('this.productsArray', this.productsArray)
      }, error => {
        console.error('Error loading data', error);
      });
  }

  createProductForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(40)]],
      mob: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10), Validators.pattern(/^\d{6,10}$/)]],
      date: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      totalQuantity: [''],
      totalValue: [''],
      discount: [''],
      invoiceAmt: [''],
      products: this.fb.array([])
    });
    this.addProduct();
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  get products(): FormArray<FormGroup> {
    return this.productForm.controls["products"] as FormArray<FormGroup>;
  }

  addProduct() {
    const productGroup = this.fb.group({
      productId: ['', [Validators.required,]],
      code: [''],
      rate: ['', [Validators.required, Validators.min(1)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      allValue: ['']
    });
    this.products.push(productGroup);
  }

  deleteProduct(productIndex: number) {
    this.products.removeAt(productIndex);
  }

  onAddedProductId(productIndex: number) {
    for (let i = 0; i < this.productsArray.length; i++) {
      if (this.products.controls[productIndex].controls['productId'].value === this.productsArray[i].id) {
        this.products.controls[productIndex].controls['code'].setValue(this.productsArray[i].code);
        break;
      }
      else {
        this.products.controls[productIndex].controls['code'].setValue(null);
        this.products.controls[productIndex].controls['productId'].setErrors({ required: true });
      }
    }
  }

  getProductCode(productId: any) {
    const product = this.productsArray.find(p => p.id === productId);
    return product ? product.code : '';
  }

  onAddedquantity(productIndex: number) {
    const rate: number = parseInt(this.products.controls[productIndex].controls['rate'].value);
    const quantity: number = parseInt(this.products.controls[productIndex].controls['quantity'].value);
    const value: number = rate * quantity;
    let totalQuantity: number = quantity;
    let totalValue: number = value;
    let discount: number = 0;
    let invoiceAmount: number = totalValue;
    if (rate !== 0 && quantity !== 0) {
      this.products.controls[productIndex].controls['allValue'].setValue(value);
    } else {
      this.products.controls[productIndex].controls['allValue'].setValue(null);
    }
    if (this.products.controls.length > 1) {
      totalQuantity = 0
      totalValue = 0
      for (let i = 0; i < this.products.controls.length; i++) {
        totalQuantity = totalQuantity + parseInt(this.products.controls[i].controls['quantity'].value);
        totalValue = totalValue + parseInt(this.products.controls[i].controls['allValue'].value);
        invoiceAmount = totalValue;
      }
      if (this.productForm.controls['discount'].value > 0) {
        discount = this.products.controls[productIndex].controls['discount'].value;
        invoiceAmount = totalValue - discount;
      }
    }
    this.productForm.controls['totalQuantity'].setValue(totalQuantity);
    this.productForm.controls['totalValue'].setValue(totalValue);
    this.productForm.controls['invoiceAmt'].setValue(invoiceAmount);
    this.productForm.controls['totalQuantity'].updateValueAndValidity();
    this.productForm.controls['totalValue'].updateValueAndValidity();
    this.productForm.controls['invoiceAmt'].updateValueAndValidity();
  }

  onAddedDiscount() {
    const discount = parseInt(this.productForm.controls['discount'].value);
    const totalValue = parseInt(this.productForm.controls['totalValue'].value);
    if (totalValue != discount && discount < totalValue) {
      const invoiceAmount = totalValue - discount;
      this.productForm.controls['invoiceAmt'].setValue(invoiceAmount);
    } else {
      // this.productForm.controls['invoiceAmt'].setValue(0);
      this.productForm.controls['invoiceAmt'].setValidators(Validators.max(totalValue - 1));
      this.productForm.controls['invoiceAmt'].updateValueAndValidity();
    }
  }

  onClickSubmit() {
    this.submitted = true;
    if (this.productForm.valid) {
      let resObj: ResObj = {
        Name: this.productForm.controls['name'].value,
        Date: this.productForm.controls['date'].value,
        Mobile: this.productForm.controls['mob'].value,
        Email: this.productForm.controls['email'].value,
        TotalQuantity: this.productForm.controls['totalQuantity'].value,
        TotalValue: this.productForm.controls['totalValue'].value,
        Discount: this.productForm.controls['discount'].value,
        InvoiceAmount: this.productForm.controls['invoiceAmt'].value,
        Products: []
      }
      for (let i = 0; i < this.products.controls.length; i++) {
        let obj: Product = {
          Id: this.products.controls[i].controls['productId'].value,
          Code: this.products.controls[i].controls['code'].value,
          Rate: this.products.controls[i].controls['rate'].value,
          Quantity: this.products.controls[i].controls['quantity'].value,
          Value: this.products.controls[i].controls['allValue'].value,
        }
        resObj.Products.push(obj);
      }
      this.sendData = resObj;
    }
  }

  onClickClear() {
    this.productForm.reset();
    this.submitted = false;
    this.sendData = null;
  }

  onClickLogOut() {
    this.route.navigateByUrl('/login');
    this.cs.isUserLogIn = false;
  }

}
