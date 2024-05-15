import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginService} from "./login.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  clientId = 'v5pkqkcte7tq8vk'; // Azonosító a Dropbox alkalmazáshoz (clientId)
  redirectUri = 'http://localhost:4200'; // Átirányítási URI a bejelentkezési folyamat befejezése után

  // Dropbox OAuth2 engedélyezési URL-je, amely a clientId és redirectUri értékeket tartalmazza
  authorizationUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=token`;

  constructor(private http: HttpClient, private service: LoginService, private router: Router) {}

  // Megkezdi a Dropbox OAuth2 bejelentkezési folyamatát
  authenticate(): void {
    window.location.href = this.authorizationUrl;
  }

  ngOnInit(): void {
    this.handleAuthorizationCode();
  }

  // A Dropbox által a redirectUri-re átirányításkor az URL hash-ében visszaadott hozzáférési kódot kezeli
  handleAuthorizationCode(): void {
const urlHash = window.location.hash;
if (urlHash) {
    const accessToken = urlHash.split('&')[0].split('=')[1];
    
    // A hozzáférési token tárolása a LoginService-ben
    this.service.token = accessToken

    // Navigálás a fájlok listázó oldalra
    this.router.navigate(['/files', '']);
} else {
    console.error("Nem megfelelő URL.");
}


  }
}
