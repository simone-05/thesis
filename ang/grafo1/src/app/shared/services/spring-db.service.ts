import { Graph } from 'src/app/layout/main/graph/graph-editing.service';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http"
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpringDbService {
  baseUrl = "http://localhost:8090/api/graphs";
  headers = { headers: { "Content-Type": "application/json" } };

  constructor(private http: HttpClient) { }

  getAll(): Observable<Graph[]> {
    return this.http.get<Graph[]>(this.baseUrl);
  }

  get(id: String): Observable<Graph> {
    return this.http.get<Graph>(this.baseUrl+"/"+id);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data, this.headers);
  }

  update(id: String, data: any): Observable<any>{
    return this.http.put(this.baseUrl+"/"+id, data);
  }

  delete(id: String): Observable<any> {
    return this.http.delete(this.baseUrl+"/"+id);
  }

  deleteAll(): Observable<any> {
    return this.http.delete(this.baseUrl);
  }

  findById(id: String): Observable<Graph[]> {
    return this.http.get<Graph[]>(this.baseUrl+"?id="+id);
  }

  checkGraphExists(name: string): Observable<any> {
    return this.http.get(this.baseUrl+"/find/"+name);
  }
}
