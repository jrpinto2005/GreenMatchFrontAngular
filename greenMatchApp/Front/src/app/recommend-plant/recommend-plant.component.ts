import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from 'express';

@Component({
  selector: 'app-recommend-plant',
  standalone: true,
  templateUrl: './recommend-plant.component.html',
  styleUrls: ['./recommend-plant.component.scss'],
  imports: [CommonModule, RouterLink],
})
export class RecommendPlantComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
