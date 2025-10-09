import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-support',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    TranslatePipe
  ],
  templateUrl: './support.html',
  standalone: true,
  styleUrl: './support.css'
})
export class Support {
  supportForm = {
    fullName: '',
    email: '',
    phone: '',
    problemType: '',
    description: ''
  };

  problemTypes = [
    { value: 'technical', label: 'support.technical' },
    { value: 'billing', label: 'support.billing' },
    { value: 'account', label: 'support.account' },
    { value: 'medication', label: 'support.medication' },
    { value: 'general', label: 'support.general' }
  ];

  onSubmit() {
    console.log('Support form submitted:', this.supportForm);
    alert('Thank you for your submission! Our team will contact you shortly.');
    
    // Reset form
    this.supportForm = {
      fullName: '',
      email: '',
      phone: '',
      problemType: '',
      description: ''
    };
  }
}
