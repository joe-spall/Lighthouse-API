import { Component, OnInit } from '@angular/core';
import { Crime } from '../crime';
import { CrimeService } from '../crime.service';
import { CrimeDetailsComponent } from '../crime-details/crime-details.component';


@Component({
  selector: 'app-crime-list',
  templateUrl: './crime-list.component.html',
  styleUrls: ['./crime-list.component.css'],
  providers: [CrimeService]
})
export class CrimeListComponent implements OnInit {

  crimes: Crime[]
  selectedcrime: Crime

  constructor(private crimeService: CrimeService) { }

  ngOnInit() {
     this.crimeService
      .getCrimes()
      .then((crimes: Crime[]) => {
        this.crimes = crimes.map((crime) => {
          return crime;
        });
      });
  }

  private getIndexOfCrime = (crimeId: String) => {
    return this.crimes.findIndex((crime) => {
      return crime._id === crimeId;
    });
  }

  selectCrime(crime: Crime) {
    this.selectedcrime = crime
  }

  createNewCrime() {
    var crime: Crime = {
      timestamp: new Date(),
      crime: '',
      coordinates: [0, 0]
    };

    // By default, a newly-created crime will have the selected state.
    this.selectCrime(crime);
  }

  deleteCrime = (crimeId: String) => {
    var idx = this.getIndexOfCrime(crimeId);
    if (idx !== -1) {
      this.crimes.splice(idx, 1);
      this.selectCrime(null);
    }
    return this.crimes;
  }

  addCrime = (crime: Crime) => {
    this.crimes.push(crime);
    this.selectCrime(crime);
    return this.crimes;
  }

  updateCrime = (crime: Crime) => {
    var idx = this.getIndexOfCrime(crime._id);
    if (idx !== -1) {
      this.crimes[idx] = crime;
      this.selectCrime(crime);
    }
    return this.crimes;
  }
}
