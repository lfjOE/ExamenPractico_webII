import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IPayPalConfig, ICreateOrderRequest, NgxPayPalModule } from 'ngx-paypal';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-paypal',
  imports: [NgxPayPalModule],
  templateUrl: './paypal.html',
  styleUrl: './paypal.css'
})
export class Paypal implements OnInit {
  public payPalConfig?: IPayPalConfig;

  @Output() pagoAutorizado = new EventEmitter<void>();
  @Input() productos: Producto[] = [];

  ngOnInit(): void {
    this.initConfig();
  }

  private calcularSubtotal(): number {
    return this.productos.reduce((sum, producto) => sum + producto.precio, 0);
  }

  private calcularIVA(): number {
    return this.calcularSubtotal() * 0.16;
  }

  private calcularTotal(): number {
    return this.calcularSubtotal() + this.calcularIVA();
  }

  private initConfig(): void {
    const subtotal = this.calcularSubtotal();
    const iva = this.calcularIVA();
    const total = this.calcularTotal();

    // Convertir productos a items de PayPal
    const items = this.productos.map(producto => ({
      name: producto.nombre,
      quantity: '1',
      category: 'PHYSICAL_GOODS' as const,
      unit_amount: {
        currency_code: 'USD',
        value: producto.precio.toFixed(2),
      },
      description: producto.descripcion || ''
    }));

    // Agregar el IVA como un item separado
    items.push({
      name: 'IVA (16%)',
      quantity: '1',
      category: 'PHYSICAL_GOODS' as const,
      unit_amount: {
        currency_code: 'USD',
        value: iva.toFixed(2),
      },
      description: 'Impuesto al Valor Agregado'
    });

    this.payPalConfig = {
      currency: 'USD',
      clientId: 'AUefwwBarLq7iQFmiLlkjvEqSVC--rPRYRodTNGKDJThZVVUllOynPI9JfbJ5EZxSZsB39Gf2vfvDlsz',
      createOrderOnClient: (data:any) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: total.toFixed(2)
                }
              }
            },
            items: items
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data:any, actions:any) => {
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then((details: any) => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);
        });
      },
      onClientAuthorization: (data:any) => {
        console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
        this.pagoAutorizado.emit();
      },
      onCancel: (data:any, actions:any) => {
        console.log('OnCancel', data, actions);
      },
      onError: (err: any) => {
        console.log('OnError', err);
      },
      onClick: (data:any, actions:any) => {
        console.log('onClick', data, actions);
      },
    };
  }
}