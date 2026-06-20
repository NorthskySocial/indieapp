# Bluesky Social App

Welcome friends! This is the codebase for the Bluesky Social app.

Get the app itself:

- **Web: [bsky.app](https://bsky.app)**
- **iOS: [App Store](https://apps.apple.com/us/app/bluesky-social/id6444370199)**
- **Android: [Play Store](https://play.google.com/store/apps/details?id=xyz.blueskyweb.app)**

## Development Resources

This is a [React Native](https://reactnative.dev/) application, written in the TypeScript programming language. It builds on the `atproto` TypeScript packages (like [`@atproto/api`](https://www.npmjs.com/package/@atproto/api)), which are also open source, but in [a different git repository](https://github.com/bluesky-social/atproto).

There is a small amount of Go language source code (in `./bskyweb/`), for a web service that returns the React Native Web application.

The [Build Instructions](./docs/build.md) are a good place to get started with the app itself.

The Authenticated Transfer Protocol ("AT Protocol" or "atproto") is a decentralized social media protocol. You don't *need* to understand AT Protocol to work with this application, but it can help. Learn more at:

- [Overview and Guides](https://atproto.com/guides/overview)
- [GitHub Discussions](https://github.com/bluesky-social/atproto/discussions) 👈 Great place to ask questions
- [Protocol Specifications](https://atproto.com/specs/atp)
- [Blogpost on self-authenticating data structures](https://bsky.social/about/blog/3-6-2022-a-self-authenticating-social-protocol)

The Bluesky Social application encompasses a set of schemas and APIs built in the overall AT Protocol framework. The namespace for these "Lexicons" is `app.bsky.*`.

## Stratos Integration

This app includes integration with [Stratos](https://github.com/NorthskySocial/stratos), a boundary-aware private namespace service for the AT Protocol.

### Configuration

Set the Stratos service DID via environment variable or indie settings:

```bash
EXPO_PUBLIC_STRATOS_SERVICE_DID=did:web:stratos.northsky.com
```

Or in your `src/indie-settings/settings.ts`:

```typescript
STRATOS_SERVICE_DID: 'did:web:stratos.northsky.com'
```

### Architecture

The Stratos integration is managed through `src/state/stratos.tsx` which provides:

- **`StratosProvider`** — React context provider wrapping the app with Stratos state.
- **`StratosSessionListener`** — Auto-discovers the user's Stratos enrollment when they log in and manages XRPC routing.
- **`useStratos()`** — Hook returning `{enrollment, active, serviceUrl, setEnrollment, setActive, reset}`.
- **`useStratosServiceUrl()`** — Convenience hook for the resolved Stratos service URL.
- **`useStratosFetchHandler()`** — Returns an authenticated fetch handler that routes XRPC calls to the Stratos service (or `null` if not enrolled/active).
- **`createStratosAuthHandler(accessJwt)`** — Pure function that creates a fetch handler attaching Bearer token auth, for use with `createServiceFetchHandler` from `@northskysocial/stratos-client`.

### XRPC Routing

When Stratos is **active** and a valid **enrollment** exists, all XRPC calls from the app's `BskyAppAgent` are automatically routed through the Stratos service. This is managed by `StratosSessionListener`, which installs a fetch override (`setStratosFetchOverride` in `src/state/session/agent.ts`) whenever Stratos becomes active with an enrollment, and clears it when Stratos is inactive, the user logs out, or the listener unmounts.

### Enrollment Flow

1. User logs in → `StratosSessionListener` calls `getEnrollmentByServiceDid()` on the user's PDS.
2. If an enrollment record exists → stored in React context as `enrollment`.
3. `serviceUrl` is derived from the enrollment via `resolveServiceUrl()`.
4. If `active` is `true` and enrollment exists → the listener installs a fetch override that routes all XRPC calls through the Stratos service.
5. Components can use `useStratosFetchHandler()` to make authenticated XRPC calls routed to the Stratos service.

### Settings UI

The **StratosSettings** screen (`src/screens/Settings/StratosSettings.tsx`) lets users:
- Set or override the Stratos service DID manually.
- Toggle Stratos on/off via an **Active** switch.
- View their current enrollment status (checking / not enrolled / connected).
- Refresh enrollment discovery or reset Stratos state.

## Contributions

> [!NOTE]
> While we do accept contributions, we prioritize high quality issues and pull requests. Adhering to the below guidelines will ensure a more timely review.

**Rules:**

- We may not respond to your issue or PR.
- We may close an issue or PR without much feedback.
- We may lock discussions or contributions if our attention is getting DDOSed.
- We're not going to provide support for build issues.

**Guidelines:**

- Check for existing issues before filing a new one please.
- Open an issue and give some time for discussion before submitting a PR.
- Stay away from PRs like...
  - Changing "Post" to "Skeet."
  - Refactoring the codebase, e.g., to replace React Query with Redux Toolkit or something.
  - Adding entirely new features without prior discussion. 

Remember, we serve a wide community of users. Our day-to-day involves us constantly asking "which top priority is our top priority." If you submit well-written PRs that solve problems concisely, that's an awesome contribution. Otherwise, as much as we'd love to accept your ideas and contributions, we really don't have the bandwidth. That's what forking is for!

## Forking guidelines

You have our blessing 🪄✨ to fork this application! However, it's very important to be clear to users when you're giving them a fork.

Please be sure to:

- Change all branding in the repository and UI to clearly differentiate from Bluesky.
- Change any support links (feedback, email, terms of service, etc) to your own systems.
- Replace any analytics or error-collection systems with your own so we don't get super confused.

## Security disclosures

If you discover any security issues, please send an email to security@bsky.app. The email is automatically CC'd to the entire team and we'll respond promptly.

## Are you a developer interested in building on atproto?

Bluesky is an open social network built on the AT Protocol, a flexible technology that will never lock developers out of the ecosystems that they help build. With atproto, third-party integration can be as seamless as first-party through custom feeds, federated services, clients, and more.

## License (MIT)

See [./LICENSE](./LICENSE) for the full license.

Bluesky Social PBC has committed to a software patent non-aggression pledge. For details see [the original announcement](https://bsky.social/about/blog/10-01-2025-patent-pledge).

## P.S.

We ❤️ you and all of the ways you support us. Thank you for making Bluesky a great place!
