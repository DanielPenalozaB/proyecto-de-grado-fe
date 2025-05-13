import { UB_DIALOG_DIRECTIVES } from '@/components/ui/dialog';
import { ToasterComponent } from '@/components/ui/sonner';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ...UB_DIALOG_DIRECTIVES,
    ToasterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'proyecto-de-grado-fe';
}
