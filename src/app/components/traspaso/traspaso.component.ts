import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlmacenService } from '../../services/almacen.service';
import { CommonModule } from '@angular/common';
import { forkJoin, map } from 'rxjs';
import { jsPDF } from 'jspdf';
import { ActivatedRoute } from '@angular/router';
import { SharingDataService } from '../../services/sharing-data.service';
import { UserService } from '../../services/user.service';
import { MedicamentoService } from '../../services/medicamento.service';
import { ClienteService } from '../../services/cliente.service';
import { AuthService } from '../../services/auth.service';
import { Venta } from '../../models/venta';
import { FormsModule } from '@angular/forms';
//import { Almacen } from '../../models/almacen';
import { MedicamentoTraspaso } from '../../models/MedicamentoTraspaso';
import { Almacen } from '../../models/almacen';
import Swal from 'sweetalert2';


//interface Medicamento {
  //nombreMedicamento: string;
  //stock: number;
//}

//interface Almacen {
  //id: number;
  //nombre: string;
  //direccion: string;
 // medicamentos: {
   // nombreAlmacen: string;
    //medicamentos: any[];
  //};
  //showDetails?: boolean; // propiedad para controlar la expansión
//}

@Component({
  selector: 'app-reporte-inventario',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './traspaso.component.html',
  styleUrls: ['./traspaso.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class traspasoComponent implements OnInit {
 
  traspaso: MedicamentoTraspaso;
   medicamentos: any[] = [];
   almacenes: any[] = [];
   
   usuarios: any[] = [];
  errors: any = {};
  carrito: any[] = [];
  almacenId!: number; // Ejemplo
  usuarioId: number = 2; // Ejemplo

   
   cliente: any = null; // Cliente seleccionado
   almacen: any = null// almacen seleccionado
   medicamentoId!: number;
   medicamento: any = null;
   // Texto de búsqueda
   searchText: string = '';
 
   // Clientes filtrados
   filteredAlmacenes = [...this.almacenes];
 
    // Medicamentos filtrados
    filteredMedicaments = [...this.medicamentos];
 
    filteredProducts = this.medicamentos;
    
 
   // Variables para mostrar el modal y manejar el item seleccionado
   showModal = false;
   itemSeleccionado: any = null;
 
   constructor(
     private route: ActivatedRoute,
     private sharingData: SharingDataService,
     private usuarioService: UserService,
     private medicamentoService: MedicamentoService,
     private almacenService: AlmacenService,
     private userauth: AuthService,
   ){
 
       this.traspaso = new MedicamentoTraspaso();
     }
   ngOnInit(): void {
 
    this.cargarMedicamentos();
    //this.cargarClientes();
    //this.cargarUsuarios();
    this.filterProducts();
 
   }
 
   ngOnChanges() {
     this.filterProducts();
   }
 
   // Capturar selección de cliente
   //onClientSelect(event: Event) {
     //const selectElement = event.target as HTMLSelectElement;
     //this.clienteId = Number(selectElement.value);
     //console.log('Cliente seleccionado ID:', this.clienteId);
   //}

   

   onClientAlmacen(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.almacenId = Number(selectElement.value);
    console.log('Almacen seleccionado ID:', this.almacenId);

    // Obtener el cliente completo usando el clienteId
    this.almacen = this.almacenes.find(almacen => almacen.id === this.almacenId);
    console.log('Almacen seleccionado:', this.almacen);
  }
 
 
  
   onMedicamentoSelect(event: Event) {
     const selectElement = event.target as HTMLSelectElement;
     this.medicamentoId = Number(selectElement.value);
     console.log('Medicamento seleccionado ID:', this.medicamentoId);
 
     // Obtener el cliente completo usando el clienteId
     this.medicamento = this.medicamentos.find(medicamento => medicamento.id === this.medicamentoId);
     console.log('Medicamento seleccionado:', this.medicamento);
   }
 
   // Filtrar clientes según el texto ingresado
 
 
  
   cargarMedicamentos():void{
     this.medicamentoService.findAll().subscribe(
       (data) => {
         this.medicamentos = data; // Asignamos los datos a la variable medicamentos
         this.filteredProducts = this.medicamentos;
         console.log('Medicamentos obtenidos:', this.medicamentos);
       },
       (error) => {
         console.error('Error al obtener los medicamentos:', error);
       }
     );
 
   }

   cargarAlmacenes():void{
    this.almacenService.findAll().subscribe(
      (data) => {
        this.almacenes = data; // Asignamos los datos a la variable medicamentos
        this.filteredProducts = this.almacenes;
        console.log('Almacenes obtenidos:', this.almacenes);
      },
      (error) => {
        console.error('Error al obtener los medicamentos:', error);
      }
    );

  }

  filterAlmacenes() {
    console.log(this.almacenes)
    this.filteredAlmacenes = this.almacenes.filter(almacen =>
      almacen.nombre.toLowerCase().includes(this.searchText.toLowerCase()) 
     
    );
    // Lógica para seleccionar automáticamente si el cliente existe en los resultados
    const almacenEncontrado = this.filteredAlmacenes.find(almacen =>
      almacen.nombre.toLowerCase() === this.searchText.toLowerCase() 
     
    );

    if (almacenEncontrado) {
      this.almacenId = almacenEncontrado.id; // Actualiza el idCliente automáticamente
    }
  }

 
 
   
 
 
   cargarUsuarios():void {
     this.usuarioService.findAll().subscribe(
       (data) => {
 
         this.usuarios = data; // Asignamos los datos a la variable usuarios
         console.log('Usuarios obtenidos:', this.usuarios);
 
       },
       (error) => {
         console.error('Error al obtener los usuarios:', error);
       }
     );
   }
 
 
 
   // Función para buscar cliente por nombre
  buscarUsuariosPorNombre(nombre: string) {
   return this.usuarios.find(usuario => usuario.username === nombre);
 };
 
 // Función para buscar cliente por nombre
 buscarAlmacenesPorNombre(nombre: string) {
   return this.almacenes.find(almacen => almacen.nombre === nombre);
 };
 

 
 
   onClear(almacenForm: any): void {
     this.almacen = new Almacen();
     almacenForm.reset();
     almacenForm.resetForm();
   }
 
   agregarAlCarrito(medicamento: any) {
     const item = this.carrito.find((item) => item.id === medicamento.id);
     if (item) {
       item.cantidad++;
     } else {
       this.carrito.push({ ...medicamento, cantidad: 1 });
     }
   }
 
   eliminarItem(item: any) {
     this.carrito = this.carrito.filter((producto) => producto.id !== item.id);
   }
 
   editarItem(item: any){
     console.log(item);
   }
 
   calcularTotal(): number {
     return this.carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
   }
   guardarTraspaso() {
    if (this.carrito.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'El carrito está vacío.',
        icon: 'error'
      });
      return;
    }
  
    // Creamos un array con los datos de los traspasos
    const traspasos = this.carrito.map((item) => ({
      medicamentoId: item.id,  // 'id' es el medicamentoId
      cantidad: item.cantidad  // Renombramos 'cantidadTipo' a 'cantidad'
    }));
  
    // Verificamos que el array de traspasos tiene la estructura correcta
    console.log('Traspasos:', traspasos);
  
    // Ahora llamamos al servicio para guardar los traspasos
    this.almacenService.realizarTraspaso(traspasos).subscribe(
      (response) => {
        console.log('Traspaso realizado con éxito:', response);
  
        // Si se recibe un array de errores, procesamos cada error
        if (Array.isArray(response)) {
          let errorEncontrado = false;
  
          response.forEach((msg) => {
            if (msg.includes("No hay stock disponible")) {
              errorEncontrado = true;
  
              // Mostrar un mensaje con el error de stock
              Swal.fire({
                title: 'Error con el Traspaso',
                html: `<span>No hay stock disponible del medicamento con ID: <strong>${this.medicamentoId}</strong></span> <br><span style="color:red; font-weight:bold;">No hay stock disponible</span>`,
                icon: 'error',
                showCancelButton: true,
                cancelButtonText: 'Cancelar y Eliminar Traspaso',
                reverseButtons: true, // Poner el "Cancelar" a la izquierda
                customClass: {
                  cancelButton: 'swal2-cancel-red', // Botón de cancelar en rojo
                },
                // Ocultar el botón de confirmación
                showConfirmButton: false,
                didOpen: () => {
                  // Personalizar los estilos de los botones
                  const cancelButton = document.querySelector('.swal2-cancel') as HTMLElement;
                  cancelButton.style.backgroundColor = '#e74c3c'; // Rojo
                  cancelButton.style.borderColor = '#c0392b';
                  cancelButton.style.color = 'white';
                  cancelButton.style.padding = '10px 20px';
                  cancelButton.style.fontSize = '16px';
                }
              }).then((result) => {
                if (result.isDismissed) {
                  // Vaciar el carrito si el usuario cancela
                  this.carrito = [];
                  console.log('El carrito ha sido vaciado.');
                }
              });
            }
          });
  
          // Si no se encontró el error, mostrar mensaje de éxito
          if (!errorEncontrado) {
            const mensajes = response.join('\n'); // Unir los mensajes del traspaso
  
            // Mostrar mensaje de éxito
            Swal.fire({
              title: 'Traspaso realizado con éxito',
              html: mensajes,  // Aquí se colocan los detalles del traspaso
              icon: 'success',
              confirmButtonText: 'Guardar y Generar PDF',
              confirmButtonColor: '#3498db',  // Color azul para el botón
              customClass: {
                confirmButton: 'swal2-confirm-blue'  // Clase personalizada para el botón
              }
            }).then((result) => {
              if (result.isConfirmed) {
                // Si el usuario confirma, generamos el PDF y guardamos el traspaso
                this.guardarPDF();  // Generar el PDF
                console.log('PDF generado y traspaso guardado.');
              }
            });
          }
        }
      },
      (error) => {
        console.error('Error al realizar el traspaso:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un error al realizar el traspaso.',
          icon: 'error'
        });
      }
    );
  }
 // Función para abrir el modal de edición
 abrirModalEditar(item: any) {
   this.itemSeleccionado = { ...item }; // Creamos una copia para evitar cambios directos
   this.showModal = true;
 }
 
 // Función para cerrar el modal
 cerrarModal() {
   this.showModal = false;
   this.itemSeleccionado = null;
 }
 
 // Función para guardar los cambios en la cantidad
 guardarCambios() {
   const index = this.carrito.findIndex(item => item.id === this.itemSeleccionado.id);
 
   if (index !== -1) {
 
     this.carrito[index].cantidad = this.itemSeleccionado.cantidad;
     console.log(this.carrito);
     console.log(this.itemSeleccionado);
   }
   this.cerrarModal();
 }
 
   // Método que simula guardar la venta y generar el PDF
   guardarPDF() {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    // Logotipo
    const logoURL = 'https://img.icons8.com/?size=100&id=49491&format=png&color=000000';
    doc.addImage(logoURL, 'PNG', 15, 10, 30, 30);
  
    // Encabezado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(38, 38, 38);
    doc.text("Farmacia Betania (Traspaso) ", 60, 25);
  
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Dirección: Mercado Popular", 60, 32);
    doc.text("Teléfono: (591) 776-526902", 60, 38);
  
    // Línea divisoria decorativa
    doc.setDrawColor(38, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);

  
  
    // Sección de Cliente
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(38, 38, 38);
    doc.text("Información del Almacen", 15, 60);
  
   
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Almacen Origen: Bodega`, 15, 68);
      doc.text(`Almacen Destino: Farmacia Betania`, 15, 74);
      
    
  
    // Tabla encabezado
    const tableStartY = 90;
    doc.setFillColor(58, 134, 255); // Azul vibrante
    doc.setTextColor(255, 255, 255);
    doc.rect(15, tableStartY, 180, 10, "F");
  
    doc.setFontSize(12);
    doc.text("Artículo", 20, tableStartY + 7);
    doc.text("Cantidad", 90, tableStartY + 7);
  
    // Cuerpo de la tabla
    let y = tableStartY + 15;
    const lineHeight = 10; // Altura de la línea (espaciado entre filas)
  
    this.carrito.forEach((item, index) => {
      doc.setTextColor(0, 0, 0);
  
      // Fondo gris claro para filas pares
      if (index % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 5, 180, 8, "F");
      }
  
      // Ajuste automático del nombre del producto para que no se desborde
      const nombreProducto = item.nombre;
      const cantidadProducto = item.cantidad.toString();
  
      // Dividir el nombre en varias líneas si es necesario
      const maxLineWidth = 80; // El ancho máximo para el texto antes de dividirlo
      const lines = doc.splitTextToSize(nombreProducto, maxLineWidth);
  
      // Escribir el nombre del producto
      let currentY = y;
      lines.forEach((line: string, idx: number) => {
        doc.text(line, 20, currentY);
        currentY += lineHeight; // Desplazar hacia abajo para la siguiente línea
      });
  
      // Escribir la cantidad
      doc.text(cantidadProducto, 90, y);
  
      // Actualizar la posición `y` para la siguiente fila
      y = currentY > y ? currentY : y + lineHeight; // Asegurarse de que no se sobrepongan
  
    });
  
    // Guardar el archivo PDF
    doc.save("nota-traspaso.pdf");
  }
 
   guardarVentaYGenerarPDF() {
     
 
     // 2. Generar el PDF
    // this.guardarPDF();
     // 1. Guardar la venta
     this.guardarTraspaso();
 
   }
 
 
   filterMedicamentos() {
     if (this.searchText) {
       this.filteredMedicaments = this.medicamentos.filter(medicamento =>
         medicamento.nombre.toLowerCase().includes(this.searchText.toLowerCase())
       );
     } else {
       this.filteredMedicaments = this.medicamentos; // Si no hay texto, mostrar todos
     }
   }
 
   filterProducts() {
 
     if (this.searchText.trim() === '') {
       this.filteredProducts = this.medicamentos;
       console.log('medicamentos search: ',this.medicamentos)
     }else{
       this.filteredProducts = this.medicamentos.filter(producto =>
         producto.nombre.toLowerCase().includes(this.searchText.toLowerCase())
       );
     }
 
     console.log(this.filteredProducts);
     // this.medicamentos = this.filteredProducts;
     console.log(this.medicamentos);
   }
 
 }