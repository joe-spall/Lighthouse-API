import { Injectable } from '@angular/core';
import { Crime } from './crime';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CrimeService {
  private crimesUrl = '/api/crimes';
  constructor(private http: Http) { }

  //get("/api/crimes")
  getCrimes(): Promise<void | Crime[]> {
    return this.http.get(this.crimesUrl)
               .toPromise()
               .then(response => response.json() as Crime[])
               .catch(this.handleError);
  }

  // post("/api/crimes")
  createCrime(newCrime: Crime): Promise<void | Crime> {
    return this.http.post(this.crimesUrl, newCrime)
               .toPromise()
               .then(response => response.json() as Crime)
               .catch(this.handleError);
  }

  // get("/api/crimes/:id") endpoint not used by Angular app

  // delete("/api/crimes/:id")
  deleteCrime(delCrimeId: String): Promise<void | String> {
    return this.http.delete(this.crimesUrl + '/' + delCrimeId)
               .toPromise()
               .then(response => response.json() as String)
               .catch(this.handleError);
  }

  // put("/api/crimes/:id")
  updateCrime(putCrime: Crime): Promise<void | Crime> {
    var putUrl = this.crimesUrl + '/' + putCrime._id;
    return this.http.put(putUrl, putCrime)
               .toPromise()
               .then(response => response.json() as Crime)
               .catch(this.handleError);
  }

  private handleError (error: any) {
    let errMsg = (error.message) ? error.message :
    error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
  }
}
