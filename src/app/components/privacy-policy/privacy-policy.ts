import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-privacy-policy',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './privacy-policy.html',
    styles: [`
    .privacy-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #e98f3b;
      text-align: center;
    }
    h2 {
      color: #333;
      border-bottom: 2px solid #e98f3b;
      padding-bottom: 10px;
      margin-top: 30px;
    }
    h3 {
        color: #555;
        margin-top: 20px;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 10px;
    }
    .contact-email {
        font-weight: bold;
        color: #e98f3b;
    }
  `]
})
export class PrivacyPolicyComponent { }
