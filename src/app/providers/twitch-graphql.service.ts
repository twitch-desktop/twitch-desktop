import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

/***
 *
 * Twitch GraphQL API
 * https://github.com/mauricew/twitch-graphql-api
 *
 ***/

export interface IUserInfoResponse {
  currentUser: {
    displayName: string;
  };
}
@Injectable({
  providedIn: 'root'
})
export class GetUserInfoGQL extends Query<IUserInfoResponse> {
  document = gql`
    query {
      currentUser {
        displayName
      }
    }
  `;
}

export interface ITopGamesResponse {
  games: {
    edges: [
      {
        node: {
          id: string;
          name: string;
          boxArtURL: string;
          viewersCount: number;
        };
        cursor: string;
      }
    ];
  };
}

interface IStream {
  id: string;
  broadcaster: {
    id: string;
    displayName: string;
    login: string;
    broadcastSettings: {
      title: string;
      game: {
        id: string;
        name: string;
      };
    };
  };
  previewImageURL: string;
  viewersCount: number;
  createdAt: Date;
}

export interface ITopStreamsResponse {
  streams: {
    edges: [
      {
        node: IStream;
        cursor: string;
      }
    ];
  };
}

export interface IGameStreamsResponse {
  game: {
    id: string;
    name: string;
    streams: {
      edges: [
        {
          node: IStream;
          cursor: string;
        }
      ];
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class GetTopGamesGQL extends Query<ITopGamesResponse> {
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
  providedIn: 'root'
})
export class GetTopStreamsGQL extends Query<ITopStreamsResponse> {
  document = gql`
    query getTopStreams($cursor: Cursor!) {
      streams(first: 25, after: $cursor) {
        edges {
          node {
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
  providedIn: 'root'
})
export class GetGameStreamsGQL extends Query<IGameStreamsResponse> {
  document = gql`
    query($name: String!, $cursor: Cursor!) {
      game(name: $name) {
        id
        name
        streams(first: 25, after: $cursor) {
          edges {
            node {
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
export interface IFollowsResponse {
  currentUser: {
    displayName: string;
    followedLiveUsers: {
      edges: [
        {
          node: {
            stream: IStream;
          };
          cursor: string;
        }
      ];
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class GetCurrentUserOnlineFollowsGQL extends Query<IFollowsResponse> {
  document = gql`
    query($cursor: Cursor!) {
      currentUser {
        displayName
        followedLiveUsers(first: 25, after: $cursor) {
          edges {
            node {
              stream {
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
            }
            cursor
          }
        }
      }
    }
  `;
}
