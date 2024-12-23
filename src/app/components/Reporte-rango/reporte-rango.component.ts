import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {  RouterModule } from '@angular/router';
import { ReporteService } from '../../services/reporte.service';
import { RangoFechasDto } from '../../models/RangoFechasDto';

import { VentaService } from '../../services/venta.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autoTable';


//import { RangoFechasDto } from '@models/rango-fechas.dto';
@Component({
  selector: 'reporte-rango',
  standalone: true,
  imports: [RouterModule,CommonModule,FormsModule],
  templateUrl: './reportes-rango.component.html'




})


export class ReporterangoComponent implements OnInit {




  Nitle: string = 'Reportes!';
  totalStock: number = 0;
  stockPorAlmacen: number = 0;
  ventasDiarias: number = 0;
  ventasSemanales: number = 0;
  ventasMensuales: number = 0;
  topMedicamentos: any[] = [];

  // reporte de ventas por cliente y fecha
  usuarioId: number = 1; // Valor inicial por defecto
  fecha: string = ''; // Fecha seleccionada por el usuario
  ventas: any[] = [];
  totalVendido: number = 0;
  loading = false;

  // reporte de ventas por rango
  // usuarioId: number = 1;
  fechaInicio: string = '';
  fechaFin: string = '';
  datosVentas: any;

  users:any;



  constructor(
    private dashboardService: ReporteService,
    private ventasService: VentaService,
    private userService:UserService
  ) { }

  ngOnInit(): void {
    this.loadTotalStock();
    this.loadVentasDiarias();
    this.loadVentasSemanales();
    this.loadVentasMensuales();
    this.loadTopMedicamentos(this.fechaInicio, this.fechaFin); // Llamada al servicio con las fechas
    this.userService.findAll().subscribe(
      data =>{
        this.users= data;
        console.log('Usuarios Obtenidos:',data);
      },
      error => {
        console.error('Error al obtener los usuarios', error);
      }
    );
  }

  loadTotalStock(): void {
    this.dashboardService.getTotalStock().subscribe(data => {
      this.totalStock = data;
    });
  }

  loadStockByAlmacen(almacenId: number): void {
    this.dashboardService.getStockByAlmacen(almacenId).subscribe(data => {
      this.stockPorAlmacen = data;
    });
  }

  loadVentasDiarias(): void {
    this.dashboardService.getVentasDiarias().subscribe(data => {
      this.ventasDiarias = data;
    });
  }

  loadVentasSemanales(): void {
    this.dashboardService.getVentasSemanales().subscribe(data => {
      this.ventasSemanales = data;
    });
  }

  loadVentasMensuales(): void {
    this.dashboardService.getVentasMensuales().subscribe(data => {
      this.ventasMensuales = data;
    });
  }



  loadTopMedicamentos(fechaInicio: string, fechaFin: string): void {
    const rangoFechas: RangoFechasDto = {
      fechaInicio,
      fechaFin
    };

    this.dashboardService.getTopMedicamentosVendidosSemana(rangoFechas).subscribe(
      data => {
        this.topMedicamentos = data;
        console.log('Top medicamentos vendidos:', data);
      },
      error => {
        console.error('Error al obtener los medicamentos más vendidos', error);
      }
    );


  }


  loadVentaEspecifica(fecha: string): void {
    const fechaRequest = { fecha };
    this.dashboardService.getVentaEspecifica(fechaRequest).subscribe(data => {
      console.log('Venta específica:', data);
    });
  }

  // Función para encontrar un usuario por ID
  findUserById(id: number): any | null {
    const user = this.users.find( (user: { id: number; }) => user.id === id);
    return user || null;
  }
  // metodos del reporte de ventas
  cargarVentas() {
    if (!this.fecha) {
      alert('Por favor, selecciona una fecha.');
      return;
    }

    this.loading = true;
    const data = {
      usuarioId: this.usuarioId,
      fecha: this.fecha
    };

    const foundUser = this.findUserById(this.usuarioId);

    if (foundUser) {
      console.log("Usuario encontrado:", foundUser);
    } else {
      console.log(`Usuario con ID ${this.usuarioId} no encontrado.`);
    }

    this.ventasService.obtenerVentas(data).subscribe(
      (response) => {
        this.ventas = response.ventas;
        this.totalVendido = response.totalVendido;
        console.log(this.ventas);
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener ventas:', error);
        this.loading = false;
      }
    );

  }

  


  obtenerVentas1() {
    
    this.ventasService.obtenerVentasPorRango(this.usuarioId, this.fechaInicio, this.fechaFin).subscribe(
      (data) => {
        this.datosVentas = data;
      },
      (error) => {
        console.error('Error al obtener las ventas:', error);
      }
    );
  }


  obtenerVentas(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('Por favor, selecciona un rango de fechas.');
      return;
    }
  
    this.loading = true;
    const data = {
      usuarioId: this.usuarioId,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    };
  
    const foundUser = this.findUserById(this.usuarioId);
    if (foundUser) {
      console.log("Usuario encontrado:", foundUser);
    } else {
      console.log(`Usuario con ID ${this.usuarioId} no encontrado.`);
    }
  
    // Llamada al servicio para obtener ventas por rango de fechas
    this.ventasService.obtenerVentasPorRango(this.usuarioId, this.fechaInicio, this.fechaFin).subscribe(
      (response) => {
        this.datosVentas = response;  // Asignar las ventas obtenidas
        this.totalVendido = response.totalVendido; // Asignar el total vendido
        console.log('Ventas en el rango:', this.datosVentas);
        console.log('Total vendido:', this.totalVendido);
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener ventas:', error);
        this.loading = false;
      }
    );
  }

  seleccionarUsuario(id: number): void {
    this.usuarioId = id; // Asignar el ID del usuario seleccionado al modelo
    console.log(this.usuarioId);
  }

  generatePDF1(venta_data:any,totalventas:number): void {

    const foundUser = this.findUserById(this.usuarioId);
    console.log(venta_data);
    console.log(foundUser);
    const doc = new jsPDF();

    // Logotipo
    const logoURL = 'https://img.icons8.com/?size=100&id=49491&format=png&color=000000';
    doc.addImage(logoURL, 'PNG', 15, 10, 30, 30);

    // Encabezado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(38, 38, 38);
    doc.text("Reporte de Ventas Diarias", 60, 25);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Farmacia Betania", 60, 32);
    doc.text("Dirección: Mercado Popular", 60, 38);

    // Línea divisoria decorativa
    doc.setDrawColor(38, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);

    // Datos del usuario
    const userData = foundUser;

    doc.setFontSize(12);
    doc.setTextColor('#000000');
    doc.text(`ID: ${userData.id}`, 10, 50);
    doc.text(`Nombre: ${userData.name}`, 10, 60);
    doc.text(`Cargo: ${userData.cargo}`, 10, 70);
    doc.text(`Email: ${userData.email}`, 10, 80);
    // doc.text(`Username: ${userData.username}`, 10, 90);


    // Tabla de ventas
    const ventasData = venta_data;

    doc.setTextColor('#4A90E2');
    doc.setFontSize(14);
    // doc.text('Ventas:', 10, 110);
    doc.text(`Total Vendido: Bs.-${totalventas}`, 10, 110);
    // doc.text('totalventas', 10, 110);

    autoTable(doc, {
      startY: 120,
      head: [['Venta ID', 'Monto Total']],
      body: ventasData.map((venta: { ventaId: any; montoTotal: any; }) => [venta.ventaId, `Bs.-${venta.montoTotal}`]),
      styles: {
        halign: 'center',
        fillColor: '#f4f4f4',
        textColor: '#000000',
      },
      headStyles: {
        fillColor: '#4A90E2',
        textColor: '#FFFFFF',
      },
    });

    // Guardar el PDF
    doc.save('reporte-venta.pdf');
  }

  generatePDF(venta_data: any, totalventas: number): void {
    const foundUser = this.findUserById(this.usuarioId); // Encuentra al usuario
    const doc = new jsPDF();
  
    // Logotipo
    const logoURL = 'https://img.icons8.com/?size=100&id=49491&format=png&color=000000';
    doc.addImage(logoURL, 'PNG', 15, 10, 30, 30);
  
    // Encabezado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(38, 38, 38);
    doc.text("Reporte de Ventas por Rango de Fechas", 60, 25);
  
    // Detalles del establecimiento
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Farmacia Betania", 60, 32);
    doc.text("Dirección: Mercado Popular", 60, 38);
  
    // Línea divisoria
    doc.setDrawColor(38, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);
  
    // Datos del usuario
    if (foundUser) {
      doc.setFontSize(12);
      doc.setTextColor('#000000');
      doc.text(`ID: ${foundUser.id}`, 10, 50);
      doc.text(`Nombre: ${foundUser.name}`, 10, 60);
      doc.text(`Cargo: ${foundUser.cargo}`, 10, 70);
      doc.text(`Email: ${foundUser.email}`, 10, 80);
    }
  
    // Información del rango de fechas
    doc.text(`Fecha Inicio: ${this.fechaInicio}`, 10, 90);
    doc.text(`Fecha Fin:  ${this.fechaFin}`, 10, 100);
    // Mostrar el total vendido
    doc.setTextColor('#4A90E2');
    doc.setFontSize(14);
    doc.text(`Total Vendido: Bs.-${totalventas}`, 10, 110);
  
    // Tabla de ventas
    autoTable(doc, {
      startY: 120,
      head: [['Venta ID', 'Monto Total']],
      body: venta_data.map((venta: { ventaId: any; montoTotal: any; }) => [venta.ventaId, `Bs.-${venta.montoTotal}`]),
      styles: {
        halign: 'center',
        fillColor: '#f4f4f4',
        textColor: '#000000',
      },
      headStyles: {
        fillColor: '#4A90E2',
        textColor: '#FFFFFF',
      },
    });
  
    // Guardar el PDF
    doc.save('reporte-venta.pdf');
  }
}
