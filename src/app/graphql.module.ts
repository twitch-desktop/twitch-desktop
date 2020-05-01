import { HttpHeaders } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { RetryLink } from 'apollo-link-retry';

interface Apollo {
  link: ApolloLink;
  cache: InMemoryCache;
  defaultOptions: {
    watchQuery: {
      fetchPolicy: string;
      errorPolicy: string;
    };
    query: {
      fetchPolicy: string;
      errorPolicy: string;
    };
  };
}

const uri = 'https://gql.twitch.tv/gql';
export function createApollo(httpLink: HttpLink): Apollo {
  // Middleware to inject Client-ID header on all GraphQL requests
  const authMiddleware = new ApolloLink((operation, forward) => {
    if (localStorage.getItem('authToken')) {
      operation.setContext({
        headers: new HttpHeaders().set(
          'Authorization',
          `OAuth ${localStorage.getItem('authToken')}`
        )
      });
      return forward(operation);
    } else {
      operation.setContext({
        headers: new HttpHeaders().set(
          'Client-ID',
          'kimne78kx3ncx6brgo4mv6wki5h1ko'
        )
      });
      return forward(operation);
    }
  });

  const defaultOptions = {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'ignore'
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }
  };

  return {
    link: ApolloLink.from([
      new RetryLink(),
      authMiddleware,
      httpLink.create({ uri })
    ]),
    cache: new InMemoryCache(),
    defaultOptions
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink]
    }
  ]
})
export class GraphQLModule {}
