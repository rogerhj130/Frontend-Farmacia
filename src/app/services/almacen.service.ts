import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { Almacen } from '../models/almacen';
import { MedicamentoTraspaso } from '../models/MedicamentoTraspaso';
import { MedicamentoStockDto } from '../models/medicamento-stock';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {

  private almacenes: Almacen[] = [];

  private url: string = 'http://localhost:8080/api/almacenes';

  private almacenIdVenta: number = 1;  // Asegúrate de que esté correctamente definido
  


  constructor(private http: HttpClient) { }


    findAll(): Observable<any[]> {
      return this.http.get<any[]>(this.url);
    }
    obtenerInventario(idAlmacen:number): Observable<any[]> {
      return this.http.get<any[]>(`${this.url}/listar-medicamentos/${idAlmacen}`);
    }

    realizarTraspaso(traspasos: MedicamentoTraspaso[]): Observable<any> {
      
      // Enviar los traspasos al backend, ahora pasando los datos como cuerpo de la solicitud
      return this.http.post<any>((`${this.url}/traspasar`), traspasos,);
    }
  

    findAllPageable(page: number): Observable<any> {
      return this.http.get<any[]>(`${this.url}/page/${page}`);
    }

    findById(id: number): Observable<Almacen> {
      return this.http.get<Almacen>(`${this.url}/${id}`);
    }

    create(almacen: Almacen): Observable<Almacen>{
      return this.http.post<Almacen>(this.url, almacen);
    }

    update(almacen: Almacen): Observable<Almacen>{
      return this.http.put<Almacen>(`${this.url}/${almacen.id}`, almacen);
    }

    remove(id: number): Observable<void>{
      return this.http.delete<void>(`${this.url}/${id}`);
    }

     // Método para obtener el stock de un medicamento en el almacén 1
  obtenerStockMedicamento(medicamentoId: number): Observable<number> {
    return this.http.get<number>(`${this.url}/stock/${this.almacenIdVenta}/${medicamentoId}`);
  }


   // Obtener los medicamentos con stock del almacén 1
   findMedicamentosConStock(): Observable<MedicamentoStockDto[]> {
    return this.http.get<MedicamentoStockDto[]>(`${this.url}/medicamentos/almacen1`);
  }

  findMedicamentosConStock2(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/medicamentos/almacen2`);
  }

   }



