import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../ui/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    SidebarComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {

}
