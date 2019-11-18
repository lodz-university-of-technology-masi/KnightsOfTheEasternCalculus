import {Component, Input, OnInit} from '@angular/core';
import {LoginService} from '../services/login.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  username = '';
  openFirstDropDown = false;
  openSecondDropDown = false;
  logging = false;

  constructor(private loginService: LoginService) {
  }

  ngOnInit() {
    this.loginService.currUsername.subscribe(username => this.username = username);
    this.logging = this.loginService.getLogging();
  }

  logout(): void {
    this.loginService.setLogging(false);
    this.loginService.setLogged(false);
    this.loginService.setUsername('');
  }
}
