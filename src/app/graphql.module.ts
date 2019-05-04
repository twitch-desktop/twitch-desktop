import { NgModule } from "@angular/core";
import { ApolloModule, APOLLO_OPTIONS } from "apollo-angular";
import { ApolloLink } from "apollo-link";
import { HttpLinkModule, HttpLink } from "apollo-angular-link-http";
import { RetryLink } from "apollo-link-retry";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpHeaders } from "@angular/common/http";

const uri = "https://gql.twitch.tv/gql";
export function createApollo(httpLink: HttpLink) {
  // Middleware to inject Client-ID header on all GraphQL requests
  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext({
      // Twitch Web Client-ID
      // If twitch changes it it will need to be updated
      // Maybe we can get it programmatically
      headers: new HttpHeaders().set(
        "Client-ID",
        "kimne78kx3ncx6brgo4mv6wki5h1ko"
      )
    });
    return forward(operation);
  });

  return {
    link: ApolloLink.from([
      new RetryLink(),
      authMiddleware,
      httpLink.create({ uri })
    ]),
    cache: new InMemoryCache()
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
