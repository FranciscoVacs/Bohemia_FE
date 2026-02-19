import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar.component';
import { EventListComponent } from '../../components/event-list/event-list.component';

@Component({
    selector: 'app-event-management',
    imports: [CommonModule, RouterLink, AdminNavbarComponent, EventListComponent],
    templateUrl: './event-management.component.html'
})
export class EventManagementComponent {

}
