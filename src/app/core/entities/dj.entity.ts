import {Event} from './event.entity'

export interface Dj {
 dj_name: string;
 dj_surname: string;
 dj_apodo: string;
 event: Event[]; 
}