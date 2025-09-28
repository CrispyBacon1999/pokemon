/// <reference types="vite/client" />
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import * as React from "react";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { Test, startInstance } from "~/start";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";

export const testServerMw = startInstance
  .createMiddleware()
  .server(({ next, context }) => {
    context.fromFetch;
    //      ^?
    context.fromServerMw;
    //      ^?

    return next({
      context: {
        fromIndexServerMw: true,
      },
    });
  });

export const testFnMw = startInstance
  .createMiddleware({ type: "function" })
  .middleware([testServerMw])
  .server(({ next, context }) => {
    context.fromFetch;
    //      ^?
    context.fromServerMw;
    //      ^?
    context.fromFnMw;
    //      ^?
    context.fromIndexServerMw;
    //      ^?

    return next({
      context: {
        fromIndexFnMw: true,
      },
    });
  });

export const testGetMiddleware = startInstance
  .createMiddleware()
  .server(({ next, context }) => {
    return next({
      context: {
        fromGetMiddleware: true,
      },
    });
  });

export const Route = createRootRoute({
  server: {
    middleware: [testServerMw],
    handlers: {
      GET: ({ context, next }) => {
        context.fromFetch;
        //      ^?
        context.fromServerMw;
        //      ^?
        context.fromIndexServerMw;
        //      ^?
        return next({
          context: {
            fromGet: true,
          },
        });
      },
      POST: ({ context, next }) => {
        context.fromFetch;
        context.fromServerMw;
        context.fromIndexServerMw;
        return next({
          context: {
            fromPost: true,
          },
        });
      },
    },
    // handlers: ({ createHandlers }) =>
    //   createHandlers({
    //     GET: {
    //       middleware: [testGetMiddleware],
    //       handler: ({ context, next }) => {
    //         context.fromFetch
    //         //      ^?
    //         context.fromServerMw
    //         //      ^?
    //         context.fromIndexServerMw
    //         //      ^?
    //         context.fromGetMiddleware
    //         //      ^?
    //         return next({
    //           context: {
    //             fromGet: true,
    //             fromPost: false,
    //           },
    //         })
    //       },
    //     },
    //     POST: {
    //       handler: ({ next }) => {
    //         return next({
    //           context: {
    //             fromGet: false,
    //             fromPost: true,
    //           },
    //         })
    //       },
    //     },
    //   }),
    test: (test) => {},
  },
  beforeLoad: ({ serverContext }) => {
    serverContext?.fromFetch;
    //             ^?
    serverContext?.fromServerMw;
    //             ^?
    serverContext?.fromIndexServerMw;
    //             ^?
    serverContext?.fromGet;
    //             ^?
    return serverContext;
  },
  ssr: false,
  loader: ({ context }) => {
    context?.fromFetch;
    //             ^?
    context?.fromServerMw;
    //             ^?
    context?.fromIndexServerMw;
    //             ^?
    context?.fromPost;
    //             ^?
    return new Test("test");
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "Pokemon TCG Gallery",
        description: `Quickly search for Pokemon TCG cards and see their prices across different markets.`,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/site.webmanifest", color: "#ffffff" },
      { rel: "icon", href: "/favicon.png" },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  shellComponent: RootDocument,
});

const queryClient = new QueryClient();

const enableDevtools = false;

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <html className="dark">
        <head>
          <HeadContent />
        </head>
        <body className="bg-background text-foreground min-h-screen">
          {children}
          {enableDevtools && (
            <TanStackDevtools
              plugins={[
                {
                  render: () => <TanStackRouterDevtoolsPanel />,
                  name: "Router",
                },
                {
                  render: () => <ReactQueryDevtoolsPanel />,
                  name: "Query",
                },
              ]}
            />
          )}
          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  );
}
