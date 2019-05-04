import { Injectable } from "@angular/core";
import { Query } from "apollo-angular";
import gql from "graphql-tag";

/***
 *
 * Twitch GraphQL API
 * https://github.com/mauricew/twitch-graphql-api
 *
 ***/

export interface GQLGame {
  node: {
    id: string;
    name: string;
    boxArtURL: string;
    viewersCount: number;
  };
  cursor: string;
}
export interface Response {
  games: {
    edges: GQLGame[];
  };
}

@Injectable({
  providedIn: "root"
})
export class getTopGamesGQL extends Query<Response> {
  document = gql`
    query getTopGames($cursor: Cursor!) {
      games(first: 25, after: $cursor) {
        edges {
          node {
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
