import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {AppUrl} from '../../constants/app-url';
import {environment} from '../../../environments/environment';
import {UserAuthority} from '../../models/user-authority';
import {SocialLogin} from '../../models/social-login';
import {AuthService} from 'angularx-social-login';
import {AppScope} from '../../constants/app-scope';
import {CookieService} from 'ngx-cookie-service';
import {AppConst} from '../../constants/app-const';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {


  apiUrl: string = environment.apiUrl;

  constructor(private httpClient: HttpClient, private cookieService: CookieService,
              private router: Router, private authService: AuthService) {
  }


  authenticate(username, password) {
    return this.httpClient.post<UserAuthority>(`${this.apiUrl}/authenticate`, {username, password}).pipe(
      map(
        userData => {
          const userAuth = new UserAuthority();
          userAuth.userName = userData.userName;
          userAuth.currentRole = userData.authorities[0];
          userAuth.authorities = userData.authorities;
          userAuth.jwtToken = 'Bearer ' + userData.jwtToken;
          return userAuth;
        }
      ),

    );
  }

  getAuthToken(): string {
    const cookies: {} = this.cookieService.getAll();
    return this.cookieService.get(Object.keys(cookies).find(cookieName => cookieName.endsWith(AppConst.AUTH_COOKIE_SUFFIX)));
  }

  socialLoginAuthentication(socialLoginDetails: SocialLogin) {
    return this.httpClient.post<UserAuthority>(`${this.apiUrl}/social-login`, socialLoginDetails).pipe(
      map(
        userData => {
          const userAuth = new UserAuthority();
          userAuth.userName = userData.userName;
          userAuth.currentRole = userData.authorities[0];
          userAuth.authorities = userData.authorities;
          userAuth.jwtToken = 'Bearer ' + userData.jwtToken;
          AppScope.setCurrentUser(userData);
          return userData;
        }
      )
    );
  }

  logout() {
    // remove social login
    this.authService.signOut();
    // remove oauth cookie from backend
    this.httpClient.get(this.apiUrl).subscribe();
    AppScope.setCurrentUser(null);
    this.router.navigateByUrl(AppUrl.LOGIN);
  }
}
