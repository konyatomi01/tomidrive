import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from "../login/login.service";
import { Router } from '@angular/router';
import * as db from 'dropbox';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrl: './userinfo.component.css'
})
export class UserinfoComponent implements OnInit {
  username: string = ''; // Felhasználónév (üres kezdetben)
  used_space: string = '';  // Felhasznált tárhely (üres kezdetben)

  isLoading: boolean = true; // Betöltés állapota (alapértelmezetten betöltés)

  constructor(private http: HttpClient, private service: LoginService, private router: Router) {}

  ngOnInit(): void {
    // Felhasználónév lekérdezése
    this.getUsername();

    // Felhasznált tárhely lekérdezése
    this.getSpace();

    // Betöltés befejezése
    this.isLoading = false;
  }

  dropbox = new db.Dropbox({ accessToken: this.service.token }); // Dropbox objektum létrehozása a hozzáférési tokennel

  async getUsername(): Promise<void> {
    try {
      // Felhasználói fiók adatainak lekérdezése a Dropbox API-tól
      const response = await this.dropbox.usersGetCurrentAccount();

      // Felhasználónév kinyerítése a válaszból
      this.username = response.result.name.display_name;
    } catch (error) {
      console.error('Hiba a felhasználónév lekérdezésekor:', error);
      
    }
  }

  async getSpace(): Promise<void> {
    try {
      // Felhasznált tárhely adatainak lekérdezése a Dropbox API-tól
      const response = await this.dropbox.usersGetSpaceUsage();

      // Felhasznált tárhely kiszámítása és formázása (MB-ban, két tizedesjegyre kerekítve)
      this.used_space = ((await response).result.used / 1024 / 1024).toFixed(2);
    } catch (error) {
      console.error('Hiba a felhasznált tárhely lekérdezésekor:', error);
      
    }
  }

  logOut() {
    this.router.navigate(['']); // Kijelentkezés és átirányítás a kezdőoldalra
  }
}
