import 'reflect-metadata';
import '../polyfills';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { GraphQLModule } from './graphql.module';

// Pipes
// Transforms a time string into a string representing time since that moment
@Pipe({
  name: 'twTimeSince'
})
export class TimeSincePipe implements PipeTransform {
  transform(startTime: string): string {
    //TODO: FIX THIS
    return '';
  }
}

@Pipe({
  name: 'twScaleImage'
})
export class ScaleImagePipe implements PipeTransform {
  transform(url: string, width: string, height: string): string {
    if (
      url &&
      url !== '' &&
      url.includes('{width}') &&
      url.includes('{height}')
    ) {
      return url.replace('{width}', width).replace('{height}', height);
    } else {
      return url;
    }
  }
}

// Components
import { AppComponent } from './app.component';
import { ChannelsComponent } from './components/channels/channels.component';
import { ErrorComponent } from './components/error-handler/errorhandler.component';
import { GamesComponent } from './components/games/games.component';
import { LoginFormComponent } from './components/login/login-form/login-form.component';
import { LoginComponent } from './components/login/login.component';
import { ChatComponent } from './components/player/chat/chat.component';
import { PlayerComponent } from './components/player/player.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

// Services
import { ChannelService } from './providers/channels.service';
import { ElectronService } from './providers/electron.service';
import { ErrorService } from './providers/errorhandler.service';
import { GameService } from './providers/games.service';
import { SettingsService } from './providers/settings.service';
import { SpinnerService } from './providers/spinner.service';
import { ToolbarService } from './providers/toolbar.service';
import { TwitchService } from './providers/twitch.service';

// Directives
import { InfiniteScroll } from './directives/infinitescroll.directive';
import { WebviewDirective } from './directives/webview.directive';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    // Components
    AppComponent,
    PlayerComponent,
    GamesComponent,
    ChannelsComponent,
    ToolbarComponent,
    LoginComponent,
    SpinnerComponent,
    SidebarComponent,
    ErrorComponent,
    ChatComponent,
    SettingsComponent,
    LoginFormComponent,

    // Directives
    WebviewDirective,
    InfiniteScroll,

    // Pipes
    TimeSincePipe,
    ScaleImagePipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      // Pipes
      // Transforms a time string into a string representing time since that moment
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    GraphQLModule
  ],
  providers: [
    ElectronService,
    ErrorService,
    SpinnerService,
    TwitchService,
    ToolbarService,
    GameService,
    ChannelService,
    SettingsService,
    TimeSincePipe,
    ScaleImagePipe
  ],

  bootstrap: [AppComponent]
})
export class AppModule {}
