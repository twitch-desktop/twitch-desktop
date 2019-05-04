import { Injectable } from "@angular/core";
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';
import config from "../../../config";

// Twitch GraphQL API
// https://github.com/mauricew/twitch-graphql-api

export interface GQLGame {
    node: {
        id: string,
        name: string,
        boxArtURL: string,
        viewersCount: number
    },
    cursor: string
}
export interface Response {
    games: {
        edges: GQLGame[]
    }
}


@Injectable({
    providedIn: 'root',
})
export class getTopGamesGQL extends Query<Response> {
    document = gql`
    query asdf ($cursor: Cursor!){
      games(first: 25 after: $cursor) {
        edges {
          node{
            id
            name
            viewersCount
            boxArtURL
          }
          cursor
        }
      }
    }
  `;
}