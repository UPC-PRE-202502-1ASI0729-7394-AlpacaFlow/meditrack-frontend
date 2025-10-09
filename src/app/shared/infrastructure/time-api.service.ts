import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeEntity } from '../domain/model/time.entity';
import { TimeService } from './time.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimeApiService extends TimeService {
  
  constructor(private http: HttpClient) {
    super();
  }

  getCurrentTime(): Observable<TimeEntity> {
    return this.http.get<TimeEntity>(environment.timeApiUrl);
  }
}