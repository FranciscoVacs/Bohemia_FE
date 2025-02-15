import {Event} from './'
import { BaseEntity } from './';

export interface Dj extends BaseEntity {
 dj_name: string;
 dj_surname: string;
 dj_apodo: string;
 event?: Event[]; 
}