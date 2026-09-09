import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  HeelSize,
  CreateHeelSizeDto
} from '../models/heel-size.model';

@Injectable({
  providedIn: 'root'
})
export class HeelSizeService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiBaseUrl}/heelsizes`;

  getHeelSizes(): Observable<HeelSize[]> {
    return this.http.get<HeelSize[]>(this.apiUrl);
  }

  getHeelSize(id: number): Observable<HeelSize> {
    return this.http.get<HeelSize>(
      `${this.apiUrl}/${id}`
    );
  }

  createHeelSize(
    dto: CreateHeelSizeDto
  ): Observable<HeelSize> {

    return this.http.post<HeelSize>(
      this.apiUrl,
      dto
    );
  }

  updateHeelSize(
    id: number,
    dto: CreateHeelSizeDto
  ): Observable<void> {

    return this.http.put<void>(
      `${this.apiUrl}/${id}`,
      dto
    );
  }

  deleteHeelSize(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}