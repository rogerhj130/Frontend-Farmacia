import { Component, Input } from '@angular/core';
import jsPDF from 'jspdf';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-compra-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compra-modal.component.html',
  styleUrl: './venta-modal.component.css'
})
export class CompraModalComponent {
  @Input() compra: any;
  @Input() isOpen = false;

  onClose() {
    this.isOpen = false;
  }

  generatePDF() {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Cargar el logotipo de forma remota
    const logoURL = 'https://img.icons8.com/?size=100&id=49491&format=png&color=000000';

    // Agregar logotipo al PDF
    doc.addImage(logoURL, 'PNG', 15, 10, 30, 30);

    // Encabezado
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 150, 243);
    doc.text("Detalles de la Compra", 60, 25);

    // Línea separadora
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(0.5);
    doc.line(15, 40, 195, 40);

    // Información General
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(`ID de Venta: ${this.compra.id}`, 14, 50);
    doc.text(`Monto Total: Bs.-${this.compra.montoTotal}`, 14, 60);
    doc.text(`Cantidad Total: ${this.compra.cantidadTotal}`, 14, 70);
    doc.text(`Fecha de Venta: ${this.compra.fechaCompra}`, 14, 80);

    // Información del cliente
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 150, 243);
    doc.text("Información ", 14, 100);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(`Nombre del Proveedor: ${this.compra.proveedorNombre}`, 14, 110);
    doc.text(`Nombre del Usuario: ${this.compra.usuarioNombre}`, 14, 120);

    // Sección de productos con detalles
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 150, 243);
    doc.text("Productos en la Compra", 14, 140);

    let currentY = 150;
    for (const item of this.compra.detalleCompras) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`Medicamento: ${item.medicamentoNombre}`, 14, currentY);
      doc.text(`Cantidad: ${item.cantidadTipo}`, 100, currentY);
      doc.text(`Monto: Bs.-${item.montoTipo}`, 160, currentY);
      currentY += 8; // Espaciado entre los detalles
    }

    // Pie de página con información adicional
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Generado por el sistema de gestión de compras.",
      14,
      280
    );

    // Guardar el PDF
    doc.save('detalles-compra.pdf');
  }

}
