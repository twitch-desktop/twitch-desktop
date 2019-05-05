import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ApolloQueryResult } from "apollo-client";
import { GetUserInfoGQL, UserInfoResponse } from "./twitch-graphql.service"


export interface Login {
    logued: boolean;
    auth_token: string;
    username: string;
}

@Injectable({
    providedIn: 'root'
})
export class TwitchAuthService {
    private login: Login = {
        username: '',
        auth_token: '',
        logued: false
    };

    constructor(private getUserInfoGQL: GetUserInfoGQL) { }

    private loginChange: Subject<Login> = new Subject<Login>();
    loginChange$ = this.loginChange.asObservable();

    setAuthToken(token: string) {
        this.login.auth_token = token;
        this.login.logued = true;
        localStorage.setItem('auth_token', token);

        this.getUserInfoGQL.fetch().subscribe((result: ApolloQueryResult<UserInfoResponse>) => {
            this.login.username = result.data.currentUser.displayName;
            this.loginChange.next(this.login);
        });
    }

    getLogin() {
        return this.login;
    }
}