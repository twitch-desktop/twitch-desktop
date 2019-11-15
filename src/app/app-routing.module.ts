import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChannelsComponent } from './components/channels/channels.component';
import { GamesComponent } from './components/games/games.component';
import { LoginComponent } from './components/login/login.component';
import { PlayerComponent } from './components/player/player.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  { path: 'play/:channel', component: PlayerComponent },
  { path: 'games', component: GamesComponent },
  { path: 'channels/:game', component: ChannelsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'settings', component: SettingsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
