import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeEntity } from '../domain/model/time.entity';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export abstract class TimeService {
  abstract getCurrentTime(): Observable<TimeEntity>;
}
