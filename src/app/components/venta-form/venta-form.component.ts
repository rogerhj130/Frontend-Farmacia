import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharingDataService } from '../../services/sharing-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlmacenService } from '../../services/almacen.service';
import { Venta } from '../../models/venta';
import { VentaService } from '../../services/venta.service';
import { MedicamentoService } from '../../services/medicamento.service';
import { ClienteService } from '../../services/cliente.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { jsPDF } from 'jspdf';
import { MedicamentoStockDto } from '../../models/medicamento-stock';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'venta-form',
  standalone: true,
  imports: [FormsModule,FormsModule,CommonModule],
  templateUrl: './venta-form.component.html',



})
export class VentaFormComponent implements OnInit {


  venta: Venta;
  medicamentos: any[] = [];
  clientes: any[] = [];
  usuarios: any[] = [];
 errors: any = {};
 carrito: any[] = [];
  clienteId!: number; // Ejemplo
  usuarioId: number = 2; // Ejemplo
  cliente: any = null; // Cliente seleccionado
  medicamentoId!: number;
  medicamento: any = null;
  // Texto de búsqueda
  searchText: string = '';
  filteredMedicaments = [...this.medicamentos];

  filteredProducts = this.medicamentos;
  // Clientes filtrados
  filteredClients = [...this.clientes];

   // Medicamentos filtrados
  


  // Variables para mostrar el modal y manejar el item seleccionado
  showModal = false;
  itemSeleccionado: any = null;

  medicamentosConStock: MedicamentoStockDto[] = [];

  constructor(
    private route: ActivatedRoute,
    private sharingData: SharingDataService,
    private usuarioService: UserService,
    private medicamentoService: MedicamentoService,
    private clienteService: ClienteService,
    private ventaService: VentaService,
    private almacenService: AlmacenService,
    private userauth: AuthService,
  ){

      this.venta = new Venta();
    }
  ngOnInit(): void {

   this.cargarMedicamentos();
   this.cargarClientes();
   this.cargarUsuarios();
   this.filterProducts();
   this.cargarMedicamentosConStock();

  }

  ngOnChanges() {
    this.filterProducts();
  }

  get admin() {
    return this.userauth.isAdmin();
  }
  // Capturar selección de cliente
  //onClientSelect(event: Event) {
    //const selectElement = event.target as HTMLSelectElement;
    //this.clienteId = Number(selectElement.value);
    //console.log('Cliente seleccionado ID:', this.clienteId);
  //}


  onClientSelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.clienteId = Number(selectElement.value);
    console.log('Cliente seleccionado ID:', this.clienteId);

    // Obtener el cliente completo usando el clienteId
    this.cliente = this.clientes.find(cliente => cliente.id === this.clienteId);
    console.log('Cliente seleccionado:', this.cliente);
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

  filterClients() {
    console.log(this.clientes)
    this.filteredClients = this.clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
      cliente.paterno.toLowerCase().includes(this.searchText.toLowerCase())
    );
    // Lógica para seleccionar automáticamente si el cliente existe en los resultados
    const clienteEncontrado = this.filteredClients.find(cliente =>
      cliente.nombre.toLowerCase() === this.searchText.toLowerCase() ||
      cliente.paterno.toLowerCase() === this.searchText.toLowerCase()
    );

    if (clienteEncontrado) {
      this.clienteId = clienteEncontrado.id; // Actualiza el idCliente automáticamente
    }
  }

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


  cargarClientes():void {
    this.clienteService.findAll().subscribe(
      (data) => {

        this.clientes = data; // Asignamos los datos a la variable
        console.log('Clientes obtenidos:', this.clientes);
        this.filteredClients = [...this.clientes];
      },
      (error) => {
        console.error('Error al obtener los clientes:', error);
      }
    );
  }


  cargarUsuarios(): void {
    this.usuarioService.findAll().subscribe(
      (data) => {
        this.usuarios = data; // Asignamos los datos a la variable usuarios
        console.log('Usuarios obtenidos:', this.usuarios);
  
        // Ahora que los usuarios están cargados, asignamos el usuarioId
        const user = this.userauth.user;
        const usuario = this.usuarios.find(u => u.username === user.user.username);
        if (usuario) {
          this.usuarioId = usuario.id;
        } else {
          console.error('Usuario no encontrado en la lista');
        }
      },
      (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    );
  }

  cargarMedicamentosConStock(): void {
    this.almacenService.findMedicamentosConStock().subscribe(
      (data) => {
        this.medicamentosConStock = data;
        console.log('Medicamentos con stock:', this.medicamentosConStock);
      },
      (error) => {
        console.error('Error al obtener medicamentos con stock:', error);
      }
    );
  }


  
  



  // Función para buscar cliente por nombre
// buscarUsuariosPorNombre(nombre: string) {
  //return this.usuarios.find(usuario => usuario.username === nombre);
//};

// Función para buscar cliente por nombre
buscarClientesPorNombre(nombre: string) {
  return this.clientes.find(cliente => cliente.nombre === nombre);
};

// Función para buscar cliente por nombre
buscarClientesPorCi(ci: string) {
  return this.clientes.find(cliente => cliente.ci === ci);
};

  onClear(ventaForm: any): void {
    this.venta = new Venta();
    ventaForm.reset();
    ventaForm.resetForm();
  }
 
  agregarAlCarrito(medicamento: any) {
    const medicamentoEnStock = this.medicamentosConStock.find(m => m.id === medicamento.id);

    console.log('Medicamento en stock:', medicamentoEnStock);
    console.log('Medicamento seleccionado:', medicamento);

    // Si el medicamento no tiene stock, mostrar un mensaje de error y salir
    if (!medicamentoEnStock || medicamentoEnStock.stock === 0) {
      // Remover medicamento del carrito si tiene stock 0
      this.carrito = this.carrito.filter(item => item.id !== medicamento.id);
      Swal.fire({
        icon: 'error',
        title: 'Sin stock',
        text: `El medicamento ${medicamento.nombre} no tiene stock disponible.`,
      });
      return;
    }

    // Si el medicamento tiene stock disponible, agregarlo con cantidad 1 por defecto
    if (!medicamento.cantidad) {
      medicamento.cantidad = 1;
    }

    // Si el medicamento está en el carrito, validamos la cantidad
    const itemEnCarrito = this.carrito.find(item => item.id === medicamento.id);

    if (itemEnCarrito) {
      // Si la cantidad total excede el stock, mostramos un mensaje de advertencia
      if (itemEnCarrito.cantidad + medicamento.cantidad > medicamentoEnStock.stock) {
        Swal.fire({
          icon: 'warning',
          title: 'Cantidad excede stock',
          text: `Solo se pueden agregar ${medicamentoEnStock.stock - itemEnCarrito.cantidad} unidades más de ${medicamento.nombre}. Actualmente tienes ${itemEnCarrito.cantidad} en el carrito.`,
        });
        return;
      } else {
        // Si no excede, se actualiza la cantidad
        itemEnCarrito.cantidad += medicamento.cantidad;
      }
    } else {
      // Si el medicamento no está en el carrito, se agrega con la cantidad seleccionada
      this.carrito.push({ ...medicamento, cantidad: medicamento.cantidad });
    }

    console.log('Carrito actualizado:', this.carrito);
  }
  // Otros métodos como editar, eliminar, etc.

  eliminarItem(item: any) {
    this.carrito = this.carrito.filter((producto) => producto.id !== item.id);
  }

  editarItem(item: any){
    console.log(item);
  }

  calcularTotal(): number {
    return this.carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
  }

  guardarVenta() {
    // Obtener directamente el usuario del servicio de autenticación
    const user = this.userauth.user;
    console.log('Usuario autenticado:', user);
  
    // Asegurarnos de que el usuario esté autenticado
    if (user && user.user && user.user.username) {
      // Usamos directamente el username para obtener el usuarioId
      const usuario = this.usuarios.find(u => u.username === user.user.username);
      if (usuario) {
        this.usuarioId = usuario.id;  // Asignar el usuarioId
        console.log('Usuario encontrado:', usuario);
      } else {
        console.error('Usuario no encontrado en la lista de usuarios');
        // Manejar el caso si el usuario no se encuentra
        return;
      }
    } else {
      console.error('No hay usuario autenticado');
      return;
    }
  
    // Preparar el detalle de la venta
    const detalleVentas = this.carrito.map((item) => ({
      medicamentoId: item.id,
      cantidadTipo: item.cantidad
    }));
  
    const ventaData = {
      detalleVentas,
      clienteId: this.clienteId,
      usuarioId: this.usuarioId,
    };
    
    console.log('Venta completa:', ventaData);
  
    try {
      this.sharingData.newVentaEventEmitter.emit(ventaData);
      return true;
    } catch (error) {
      console.error("Error al guardar la venta:", error);
      return false;
    }
  }

  // Nueva lógica de búsqueda de usuarios
  buscarUsuariosPorNombre(nombre: string) {
    return this.usuarios.find(usuario => usuario.username === nombre);
  }

  // Filtro de medicamentos según texto
  filterMedicamentos() {
    if (this.searchText) {
      this.filteredMedicaments = this.medicamentos.filter(medicamento =>
        medicamento.nombre.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredMedicaments = this.medicamentos;
    }
  }

  /// Método para filtrar los productos según el texto de búsqueda
filterProducts() {
  // Si el texto de búsqueda está vacío
  if (this.searchText.trim() === '') {
    // Mostrar solo los primeros 4 productos
    this.filteredProducts = this.medicamentos.slice(0, 4);
  } else {
    // Filtrar los productos que contienen el texto de búsqueda en el nombre
    this.filteredProducts = this.medicamentos.filter(producto =>
      producto.nombre.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Mostrar los productos filtrados en consola (opcional para depuración)
  console.log('medicamentos filtrados',this.filteredProducts);
}
   
      // Aquí puedes manejar lo que necesites con ventaData

    //this.sharingData.newMedicamentoEventEmitter.emit(this.medicamento);

   // this.router.navigate(['/ventas']);


//}

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
  const medicamentoEnStock = this.medicamentosConStock.find(m => m.id === this.itemSeleccionado.id);
  
  if (!medicamentoEnStock) {
    Swal.fire({
      icon: 'error',
      title: 'Sin stock',
      text: `El medicamento ${this.itemSeleccionado.nombre} no tiene stock disponible.`,
    });
    return;
  }

  if (this.itemSeleccionado.cantidad > medicamentoEnStock.stock) {
    Swal.fire({
      icon: 'warning',
      title: 'Cantidad excede stock',
      text: `Solo se puede agregar ${medicamentoEnStock.stock} unidades de ${this.itemSeleccionado.nombre}. Actualmente tenemos ${medicamentoEnStock.stock} unidades disponibles.`,
    });
    return;
  }

  const index = this.carrito.findIndex(item => item.id === this.itemSeleccionado.id);

  if (index !== -1) {
    this.carrito[index].cantidad = this.itemSeleccionado.cantidad;
  }

  this.cerrarModal();
}

  // Método que simula guardar la venta y generar el PDF

  guardar1PDF() {
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
    doc.text("Farmacia Betania", 60, 25);

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
    doc.text("Información del Cliente", 15, 60);

    if (this.cliente) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Cliente: ${this.cliente.nombre} ${this.cliente.paterno}`, 15, 68);
        doc.text(`CI: ${this.cliente.ci}`, 15, 74);
    } else {
        doc.setFontSize(12);
        doc.text("Cliente: No seleccionado", 15, 68);
    }

    // Tabla encabezado
    const tableStartY = 90;
    doc.setFillColor(58, 134, 255); // Azul vibrante
    doc.setTextColor(255, 255, 255);
    doc.rect(15, tableStartY, 180, 10, "F");

    doc.setFontSize(12);
    doc.text("Artículo", 20, tableStartY + 7);
    doc.text("Cantidad", 90, tableStartY + 7);
    doc.text("Precio Unit.", 130, tableStartY + 7);
    doc.text("Total", 170, tableStartY + 7, { align: "right" });

    // Cuerpo de la tabla
    let y = tableStartY + 15;
    this.carrito.forEach((item, index) => {
        doc.setTextColor(0, 0, 0);
        if (index % 2 === 0) {
            doc.setFillColor(240, 240, 240); // Fondo gris claro para filas pares
            doc.rect(15, y - 5, 180, 8, "F");
        }
        doc.text(item.nombre, 20, y);
        doc.text(item.cantidad.toString(), 90, y);
        doc.text(item.precio.toFixed(2), 130, y);
        doc.text((item.cantidad * item.precio).toFixed(2), 190, y, { align: "right" });
        y += 8;
    });

    // Total
    const total = this.calcularTotal();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(38, 38, 38);
    doc.text("Total de la Venta:", 120, y + 10);
    doc.text(total.toFixed(2) + " Bs.", 190, y + 10, { align: "right" });

    // Guardar el archivo PDF
    doc.save("nota-venta.pdf");
}
guardarVentaYGenerarPDF() {
  // Validar si el cliente está seleccionado
  if (!this.cliente) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, seleccione un cliente antes de guardar la venta.',
    });
    return; // No proceder si no hay cliente seleccionado
  }

  // Validar si el carrito no está vacío
  if (this.carrito.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'El carrito está vacío. Debe agregar productos antes de realizar la venta.',
    });
    return; // No proceder si el carrito está vacío
  }

  // Validar si la cantidad de los productos en el carrito es válida
  for (let item of this.carrito) {
    if (item.cantidad <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `La cantidad del producto "${item.nombre}" debe ser mayor que 0.`,
      });
      return; // No proceder si alguna cantidad es inválida
    }
  }

  // Preparar los datos para la venta
  const detalleVentas = this.carrito.map((item) => ({
    medicamentoId: item.id,
    cantidadTipo: item.cantidad
  }));

  const ventaData = {
    detalleVentas,
    clienteId: this.clienteId,
    usuarioId: this.usuarioId
  };

  // Aquí estamos llamando al servicio para guardar la venta
  this.ventaService.guardarVenta(ventaData).subscribe(
    (response) => {
      // Suponemos que la respuesta es un array de mensajes
      if (Array.isArray(response)) {
        let mensajes = response.join('\n'); // Une los mensajes con saltos de línea

        // Verificar si hay medicamentos sin stock
        const medicamentosSinStock = mensajes.includes('no tiene stock disponible');

        // Resaltar el medicamento sin stock en rojo
        mensajes = mensajes.replace(/El medicamento (.*) no tiene stock disponible/g, 
          '<span style="color: red; font-weight: bold;">$&</span>');

        // Si hay medicamentos sin stock, mostrar solo el botón de "Cancelar venta"
        if (medicamentosSinStock) {
          Swal.fire({
            title: 'No se puede realizar la venta',
            html: mensajes, // Usamos 'html' para permitir etiquetas HTML en el mensaje
            icon: 'error',
            showCancelButton: true,
            cancelButtonText: 'Cancelar venta',
            confirmButtonText: '',
            reverseButtons: true, // Coloca el "Cancelar" a la izquierda
            customClass: {
              cancelButton: 'swal2-cancel-red' // Clase personalizada para el botón "Cancelar venta"
            },
            buttonsStyling: false,  // Desactivar los estilos predeterminados
            didOpen: () => {
              // Resaltar el botón "Cancelar venta" en rojo
              const cancelButton = document.querySelector('.swal2-cancel') as HTMLElement;
              cancelButton.style.backgroundColor = '#e74c3c'; // Rojo
              cancelButton.style.borderColor = '#c0392b'; // Rojo oscuro
              cancelButton.style.color = 'white';
              cancelButton.style.padding = '10px 20px';
              cancelButton.style.fontSize = '16px';
              cancelButton.style.borderRadius = '5px';
              cancelButton.style.marginRight = '10px'; // Separar botones
            }
          }).then((result) => {
            if (result.isDismissed) {
              // Si el usuario hace clic en "Cancelar venta", vaciar el carrito y revertir la venta
              this.carrito = [];  // Vaciar el carrito
              Swal.fire({
                title: 'Venta cancelada',
                text: 'La venta ha sido cancelada y el carrito se ha vaciado.',
                icon: 'info',
                confirmButtonText: 'Aceptar'
              });
            }
          });
        } else {
          // Si no hay medicamentos sin stock, proceder con "Guardar y Generar PDF"
          Swal.fire({
            title: 'Venta procesada',
            html: mensajes, // Usamos 'html' para permitir etiquetas HTML en el mensaje
            icon: 'success',
            showCancelButton: false,
            confirmButtonText: 'Guardar y Generar PDF',
            reverseButtons: true, // Coloca el "Aceptar" a la derecha
            customClass: {
              confirmButton: 'swal2-confirm-blue' // Clase personalizada para el botón "Guardar y Generar PDF"
            },
            buttonsStyling: false,  // Desactivar los estilos predeterminados
            didOpen: () => {
              // Resaltar el botón "Guardar y Generar PDF" en azul
              const confirmButton = document.querySelector('.swal2-confirm') as HTMLElement;
              confirmButton.style.backgroundColor = '#3498db'; // Azul
              confirmButton.style.borderColor = '#2980b9'; // Azul oscuro
              confirmButton.style.color = 'white';
              confirmButton.style.padding = '10px 20px';
              confirmButton.style.fontSize = '16px';
              confirmButton.style.borderRadius = '5px';
              confirmButton.style.marginLeft = '10px'; // Separar botones
            }
          }).then((result) => {
            if (result.isConfirmed) {
              // Si el usuario hace clic en "Guardar y Generar PDF", guardar la venta y generar el PDF
              this.guardar1PDF();
              // Limpiar el carrito después de guardar
              this.carrito = [];
            }
          });
        }
      }
    },
    (error) => {
      // En caso de error, mostrar un mensaje con el error
      console.error('Error al guardar la venta:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al realizar la venta. Por favor intente nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  );
}


}



