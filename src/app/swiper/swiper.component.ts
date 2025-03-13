import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgFor } from '@angular/common';
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-swiper',
  standalone: true,
  imports: [NgFor],
  templateUrl: './swiper.component.html',
  styleUrl: './swiper.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SwiperComponent {

  images: string[] = [
    'assets/@dolciraw-034.jpg',    'assets/@dolciraw-037.jpg',    'assets/@dolciraw-216.jpg',    'assets/@dolciraw-228.jpg',
    'assets/@dolciraw-038.jpg',    'assets/@dolciraw-048.jpg',    'assets/@dolciraw-050.jpg',    'assets/@dolciraw-051.jpg',
    'assets/@dolciraw-055.jpg',    'assets/@dolciraw-060.jpg',    'assets/@dolciraw-065.jpg',    'assets/@dolciraw-066.jpg',
    'assets/@dolciraw-166.jpg',    'assets/@dolciraw-167.jpg',    'assets/@dolciraw-168.jpg',    'assets/@dolciraw-172.jpg',
    'assets/@dolciraw-174.jpg',    'assets/@dolciraw-179.jpg',    'assets/@dolciraw-181.jpg',    'assets/@dolciraw-185.jpg',
    'assets/@dolciraw-186.jpg',    'assets/@dolciraw-197.jpg',    'assets/@dolciraw-198.jpg',    'assets/@dolciraw-201.jpg',
    'assets/@dolciraw-202.jpg',    'assets/@dolciraw-209.jpg',    'assets/@dolciraw-210.jpg',    'assets/@dolciraw-211.jpg',
    'assets/@dolciraw-212.jpg',    'assets/@dolciraw-215.jpg'
  ]

}
