import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';

interface Plant {
  id?: number;
  name?: string;
  watered?: number;
  // add fields that match assets/data/plants.json
}

@Component({
  selector: 'app-add-plant',
  standalone: true,
  templateUrl: './add-plant.component.html',
  styleUrls: ['./add-plant.component.scss'],
  imports: [CommonModule,
            RouterLink],
})
export class AddPlantComponent implements OnInit {

  form!: FormGroup;
  submitting = false;

  constructor(private http: HttpClient,
              private fb: FormBuilder,
              private router: Router
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      watered: [0, [Validators.min(0)]],
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;
    this.submitting = true;

    this.http.post(`${environment.apiUrl}/plants`, payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/mis-plantas']);
      },
      error: err => {
        this.submitting = false;
        console.error('Failed to save plant', err);
      }
    });
  }

}
