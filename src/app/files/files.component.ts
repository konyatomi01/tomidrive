import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from "../login/login.service";
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {IFile, IFolder} from '../data/data'


@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {
  files: IFile[] = []; // Lista a fájlok adatainak tárolására
  folders: IFolder[] = []; // Lista a mappák adatainak tárolására
  data: any[] = []; // Válasz adatok a Dropbox API-tól (ideiglenes)
  path: string = ''; // Aktuális elérési út
  paths: string[] = []; // Előző elérési utak navigáláshoz (többszintű mappaszint)

  @ViewChild('fileInput') fileInput!: ElementRef; // Fájlbeviteli elem referenciája

  isLoading: boolean = true; // Betöltés állapota

  constructor(private http: HttpClient, private service: LoginService, private router: Router, ) {}

  ngOnInit(): void {
    this.getFiles() // Fájlok és mappák lekérdezése
  }
  
  
  //Fájlok és mappák lekérdezése a Dropbox API-ból.
  getUserFiles(): Observable<any> {
    const endpoint = 'https://api.dropboxapi.com/2/files/list_folder';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.service.token}`,
      'Content-Type': 'application/json'
    });

    const body = {
      path: this.path,
      recursive: false,
      include_media_info: false,
      include_deleted: false,
      include_has_explicit_shared_members: false,
      include_mounted_folders: true,
      include_non_downloadable_files: false
    };

    return this.http.post<any>(endpoint, body, { headers });
  }


  //Adatok frissítése a kiválasztott mappához.
  getFiles() {
    this.folders = []
    this.files = []
    this.getUserFiles().subscribe(
      response => {
        this.data = response.entries
        this.data.forEach((entry: any) => { 
          if (Object.keys(entry).length>7) {
            const newFile: IFile = { // Fájl objektum létrehozása
              id: entry.id,
              name: entry.name,
              path_display: entry.path_display,
              path_lower: entry.path_lower,
              size: entry.size,
              client_modified: entry.client_modified
            }
            this.files.push(newFile); // Fájl hozzáadása a listához
          } else {
            const newFolder: IFolder = { // Mappa objektum létrehozása
              id: entry.id,
              name: entry.name,
              path_display: entry.path_display,
              path_lower: entry.path_lower
            };
            this.folders.push(newFolder); // Mappa hozzáadása a listához
          }
        });
        this.isLoading = false; // Betöltés befejezése
        
      },
      error => {
        this.isLoading = false;
        console.error('Hiba a felhasználói fájlok lekérdezésekor:', error);
      }
    );
  }


  //Mappakre kattintás kezelése (navigáció, frissítés).
  folderClick(_path: string) {
    this.paths.push(this.path) // Aktuális elérési út elmentése a navigációs előzményekbe
    this.router.navigate(['/files', '/'+_path]); // Navigálás a kiválasztott mappához
    this.path += '/'+_path // Aktuális elérési út frissítése
    this.getFiles() // Fájlok és mappák újralekérdezése
    
  }


  //Új mappa létrehozása (felhasználói bevitel alapján).
  newFolder(): void {
    const name = prompt('Enter folder name:'); // Mappa név bekérése
  
    if (name) {
      const path = `${this.path}/${name}`;
      this.createFolder(path).subscribe(
        (response) => {
          this.getFiles() // Sikeres mappa létrehozása esetén fájlok és mappák újralekérdezése
        },
        (error) => {
          console.error('Hiba a mappa létrehozásakor:', error);
        }
      );
    }
  }

  //Mappa létrehozása a Dropbox API-ban.
  createFolder(path: string): Observable<any> {
    const endpoint = 'https://api.dropboxapi.com/2/files/create_folder';
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.service.token}`,
      'Content-Type': 'application/json'
    });
  
    const body = {
      path: path, // Létrehozandó mappa elérési útja
      autorename: false
    };
  
    return this.http.post<any>(endpoint, body, { headers });
  }


  //Fájl kiválasztása (fájlbeviteli elem).
  selectFile() {
    this.fileInput.nativeElement.click(); // Fájlbeviteli elemre kattintás szimulálása
  }

  //Fájl feltöltése és adatok frissítése.
  onFileSelected(event: any) {
    const file: File = event.target.files[0]; // Kiválasztott fájl
    this.uploadFile(file).subscribe(
      (data) => {
        this.getFiles() // Sikeres feltöltés esetén fájlok és mappák újralekérdezése
      },
      (error) => {
        console.error('Hiba a fájl feltöltésekor:', error);
      }
    );
    
  }

  //Fájl feltöltése a Dropbox API-ba.
  uploadFile(file: File): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.service.token,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: this.path+'/'+file.name,
        mode: 'add',
        autorename: true,
        mute: false
      })
    });

    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(
      'https://content.dropboxapi.com/2/files/upload',
      formData,
      {
        headers: headers,
        responseType: 'json'
      }
    );
  }



  //Vissza a korábbi mappába (navigáció, frissítés).
  back() {
    this.router.navigate(['/files', this.paths[this.paths.length-1]]); // Navigálás az előző elérési úthoz
    this.path = this.paths[this.paths.length-1] // Aktuális elérési út frissítése
    this.paths.pop() // Előzmény eltávolítása a navigációs előzményekből
    this.getFiles() // Fájlok és mappák újralekérdezése
  }
    
  //Ideiglenes letöltési link kérése.
  getDownloadLink(name: string): Observable<any> {
    const endpoint = 'https://api.dropboxapi.com/2/files/get_temporary_link';
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.service.token}`,
      'Content-Type': 'application/json'
    });
    const body = JSON.stringify({ path: this.path+'/'+name }); //fájl elérési útja
  
    return this.http.post(endpoint, body, { headers: headers })
      
  }

  //Fájl letöltése (link alapján, szimulált kattintás).
  downloadFile(name:string) {
    this.getDownloadLink(name).subscribe(
      (data) => {
        const downloadUrl = data.link; // Letöltési link kinyerítése a válaszból
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      },
      (error) => {
        console.error('Hiba a fájl letöltésekor:', error);
      }
    );
  }
  
  
  


}
