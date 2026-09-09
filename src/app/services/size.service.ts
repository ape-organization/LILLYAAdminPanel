import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Size, CreateSizeDto } from '../models/size.model';

@Injectable({
  providedIn: 'root'
})
export class SizeService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiBaseUrl}/sizes`;

  getSizes(): Observable<Size[]> {
    return this.http.get<Size[]>(this.apiUrl);
  }

  getSize(id: number): Observable<Size> {
    return this.http.get<Size>(`${this.apiUrl}/${id}`);
  }

  createSize(dto: CreateSizeDto): Observable<Size> {
    return this.http.post<Size>(this.apiUrl, dto);
  }

  updateSize(id: number, dto: CreateSizeDto): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${id}`,
      dto
    );
  }

  deleteSize(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}