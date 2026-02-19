import {
  Component,
  inject,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { ModalService } from '../services/modal.service';
import { AuthService } from '../services/auth.service';
import { NavbarStateService } from '../services/navbar-state.service';
import { CommonModule } from '@angular/common';
import { UserDropdownComponent } from '../user-dropdown/user-dropdown.component';
import { filter, Subscription } from 'rxjs';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive, CommonModule, UserDropdownComponent],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  public modalService = inject(ModalService);
  public authService = inject(AuthService);
  public navbarState = inject(NavbarStateService);
  private router = inject(Router);

  @ViewChild('navElement', { static: false }) navElement!: ElementRef<HTMLElement>;

  isScrolled = false;
  isHomePage = false;

  private mouseMoveHandler = this.onMouseMoveForTilt.bind(this);
  private routerSub!: Subscription;

  /* ---- INIT ---- */
  ngOnInit(): void {
    this.checkIfHome(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.checkIfHome((e as NavigationEnd).urlAfterRedirects || (e as NavigationEnd).url);
        // Reset scrolled state when navigating away from home
        if (!this.isHomePage) {
          this.isScrolled = false;
          if (this.navElement) {
            this.navElement.nativeElement.style.transform = '';
          }
        }
      });
  }

  private checkIfHome(url: string): void {
    // Home is exactly '/' or '/' with fragment like '/#eventos'
    this.isHomePage = url === '/' || url.startsWith('/#');
  }

  /* ---- SCROLL ---- */
  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isHomePage) return; // Only island on home
    const shouldScroll = window.scrollY > 100;
    if (shouldScroll !== this.isScrolled) {
      this.isScrolled = shouldScroll;
      if (!this.isScrolled && this.navElement) {
        this.navElement.nativeElement.style.transform = '';
      }
    }
  }

  /* ---- LIFECYCLE ---- */
  ngAfterViewInit(): void {
    document.addEventListener('mousemove', this.mouseMoveHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    this.routerSub?.unsubscribe();
  }

  /* ---- 3D TILT ON SCROLLED NAV ---- */
  private onMouseMoveForTilt(e: MouseEvent): void {
    if (!this.isScrolled || !this.navElement) return;

    const cx = window.innerWidth / 2;
    const cy = 100;
    const rx = (e.clientY - cy) * 0.015;
    const ry = (e.clientX - cx) * 0.015;

    const clamp = (n: number, min: number, max: number) =>
      Math.min(Math.max(n, min), max);

    this.navElement.nativeElement.style.transform =
      `translateX(-50%) perspective(1000px) rotateX(${-clamp(rx, -8, 8)}deg) rotateY(${clamp(ry, -8, 8)}deg)`;
  }
}
