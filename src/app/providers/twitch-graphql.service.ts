import { Injectable } from "@angular/core";
import { Query } from "apollo-angular";
import gql from "graphql-tag";

/***
 *
 * Twitch GraphQL API
 * https://github.com/mauricew/twitch-graphql-api
 *
 ***/

export interface TopGamesResponse {
  games: {
    edges: [{
      node: {
        id: string;
        name: string;
        boxArtURL: string;
        viewersCount: number;
      };
      cursor: string;
    }];
  };
}

interface Streams {
  edges: [{
    node: {
      id: string;
      broadcaster: {
        id: string;
        displayName: string;
        login: string;
        broadcastSettings: {
          title: string
          game: {
            id: string;
            name: string
          }
        }
      }
      previewImageURL: string;
      viewersCount: number
      createdAt: Date
    };
    cursor: string;
  }];
}

export interface TopStreamsResponse {
  streams: Streams;
}

export interface GameStreamsResponse {
  game: {
    id: string;
    name: string;
    streams: Streams
  };
}

@Injectable({
  providedIn: "root"
})
export class GetTopGamesGQL extends Query<TopGamesResponse> {
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


@Injectable({
  providedIn: "root"
})
export class GetTopStreamsGQL extends Query<TopStreamsResponse> {
  document = gql`
  query getTopStreams ($cursor: Cursor!){
    streams(first: 25 after: $cursor) {
      edges {
        node{
          id
          broadcaster {
            id
            displayName
            login
            broadcastSettings {
              title
              game {
                id
                name
              }
            }
          }
          previewImageURL
          viewersCount
          createdAt
        }
        cursor
        }
      }
    }
  `;
}

@Injectable({
  providedIn: "root"
})
export class GetGameStreamsGQL extends Query<GameStreamsResponse> {
  document = gql`
  query getGameStreams ($name: String!, $cursor: Cursor!){
    game(name: $name) {
      id
      name
      streams(first: 25 after: $cursor) {
        edges {
          node{
            id
            broadcaster {
              id
              displayName
              login
              broadcastSettings {
                title
                game {
                  id
                  name
                }
              }
            }
            previewImageURL
            viewersCount
            createdAt
          }
          cursor
        }
      }
    }
  }
  `;
}
