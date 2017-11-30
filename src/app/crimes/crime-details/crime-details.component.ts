import { Component, Input } from '@angular/core';
import { Crime } from '../crime';
import { CrimeService } from '../crime.service';

@Component({
  selector: 'crime-details',
  templateUrl: './crime-details.component.html',
  styleUrls: ['./crime-details.component.css']
})

export class CrimeDetailsComponent {
  @Input()
  crime: Crime;

  @Input()
  createHandler: Function;
  @Input()
  updateHandler: Function;
  @Input()
  deleteHandler: Function;

  constructor (private crimeService: CrimeService) {}

  createCrime(crime: Crime) {
    this.crimeService.createCrime(crime).then((newCrime: Crime) => {
      this.createHandler(newCrime);
    });
  }

  updateCrime(crime: Crime): void {
    this.crimeService.updateCrime(crime).then((updatedCrime: Crime) => {
      this.updateHandler(updatedCrime);
    });
  }

  deleteCrime(crimeId: String): void {
    this.crimeService.deleteCrime(crimeId).then((deletedCrimeId: String) => {
      this.deleteHandler(deletedCrimeId);
    });
  }
}
