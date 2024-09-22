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
      invoiceAmt: ['', [Validators.min(1)]],
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

    const productId = this.products.controls[productIndex].controls['productId'].value;
    const product = this.productsArray.find(p => p.id === productId);

    if (product) {
      this.products.controls[productIndex].controls['code'].setValue(product.code);
    } else {
      this.products.controls[productIndex].controls['code'].setValue(null);
      this.products.controls[productIndex].controls['productId'].setErrors({ required: true });
    }
  }

  getProductCode(productId: any) {
    const product = this.productsArray.find(p => p.id === productId);
    return product ? product.code : '';
  }

  onAddedquantity(productIndex: number) {
    const rate = this.products.controls[productIndex].controls['rate'].value || 0;
    const quantity = this.products.controls[productIndex].controls['quantity'].value || 0;
    const value = rate * quantity;
    this.products.controls[productIndex].controls['allValue'].setValue(value || null);
    this.updateTotals();
  }


  updateTotals() {
    let totalQuantity = 0;
    let totalValue = 0;
    this.products.controls.forEach(control => {
      totalQuantity += Number(control.get('quantity')?.value || 0);
      totalValue += Number(control.get('allValue')?.value || 0);
    });
    const discount = Number(this.productForm.controls['discount'].value || 0);
    const invoiceAmount = totalValue - discount;
    this.productForm.patchValue({
      totalQuantity,
      totalValue,
      invoiceAmt: Math.max(invoiceAmount, 0) 
    });
    this.productForm.controls['invoiceAmt'].setValidators([
      Validators.required,
      Validators.min(1)
    ]);
    this.productForm.controls['invoiceAmt'].updateValueAndValidity();
  }



  onAddedDiscount() {
    const discount = Number(this.productForm.controls['discount'].value || 0);
    const totalValue = Number(this.productForm.controls['totalValue'].value || 0);

    if (discount > totalValue) {
      this.productForm.controls['discount'].setErrors({ max: true });
    } else {
      const invoiceAmount = totalValue - discount;
      this.productForm.controls['invoiceAmt'].setValue(Math.max(invoiceAmount, 0)); 
    }
  }

  onClickSubmit() {
    this.submitted = true;
    if (this.productForm.valid) {
      const resObj: ResObj = {
        Name: this.productForm.controls['name'].value,
        Date: this.productForm.controls['date'].value,
        Mobile: this.productForm.controls['mob'].value,
        Email: this.productForm.controls['email'].value,
        TotalQuantity: this.productForm.controls['totalQuantity'].value,
        TotalValue: this.productForm.controls['totalValue'].value,
        Discount: this.productForm.controls['discount'].value,
        InvoiceAmount: this.productForm.controls['invoiceAmt'].value,
        Products: this.products.controls.map(control => ({
          Id: control.controls['productId'].value,
          Code: control.controls['code'].value,
          Rate: control.controls['rate'].value,
          Quantity: control.controls['quantity'].value,
          Value: control.controls['allValue'].value,
        }))
      };
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
