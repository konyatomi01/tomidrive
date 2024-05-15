import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';




@Injectable({ providedIn: "root" })
export class LoginService {

  token: string;  //access token tárolása és komponensek közzi átadása

  constructor(private http: HttpClient) {
    this.token = ''
  }

}
