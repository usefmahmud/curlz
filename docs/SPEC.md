# curlz: API Client TUI Spec (v2, revised layout)

A keyboard-driven terminal API client. Everything is stored as plain files that live in git.

## 1. Goals and non-goals

**Goals**
- Send HTTP requests, inspect responses fast, and organize requests into collections or keep them as standalone single requests.
- Store everything as human-readable files, so a team can review changes in PRs.
- Make the JSON response viewer excellent, since that's where most time is spent.

**Non-goals for the first version**
- No GraphQL, WebSocket, or gRPC support.
- No cloud sync or accounts.
- No scripting or test runner.
- No Postman import.

## 2. Screen layout

```
┌ Sidebar ─────────────┬──────────────────────────────────────────────────────────┐
│ Collections          │ [POST ▾] {{base_url}}/users                 [Send] [env] │
│ ▾ my-api             ├───────────────────────────┬──────────────────────────────┤
│   ▾ auth             │ Request                   │ Response                     │
│       login          │ Params Headers Auth Body  │ 201 Created · 142 ms · 318 B │
│       refresh        │ ───────────────────────── │ Body Headers Raw Timeline    │
│   ▾ users            │ Content-Type  application │ ▾ { }                        │
│     ► create         │ Accept        */*         │   ▸ user { 4 keys }          │
│ ▸ payments           │ X-Trace       {{trace}}   │     "id": 42                 │
│                      │                           │     "name": "Ada"            │
│ Requests             │                           │                              │
│   health-check       │                           │                              │
│   ping-prod          │                           │                              │
├──────────────────────┴───────────────────────────┴──────────────────────────────┤
│ ctrl+enter send · tab next pane · / search · ctrl+e env · ctrl+p find · ? help  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Regions

| Region | Position | Contents |
|---|---|---|
| **Sidebar** | Full-height left column | Two sections: **Collections** (folders of requests, collapsible) and **Requests** (standalone single requests that belong to no collection) |
| **Top bar** | Top of the right side | Method select, URL input, Send button, active environment indicator |
| **Request pane** | Bottom-left of the right side | Tabs: Params, Headers, Auth, Body, Settings |
| **Response pane** | Bottom-right of the right side | Status line plus tabs: Body, Headers, Raw, Timeline |
| **Status bar** | Bottom row | Context-sensitive key hints |

(Interpreted your "left side for response details" as the right side, so the request and response panes sit next to each other. Say so if you meant something else.)

### Layout rules
- Sidebar is a fixed width (default 28 columns), resizable with `ctrl+left` / `ctrl+right`, and hideable with `ctrl+b`.
- The request and response panes split the remaining width 50/50 by default, adjustable with `ctrl+[` / `ctrl+]`.
- If the terminal is narrower than about 110 columns, the request and response panes stack vertically instead of sitting side by side.
- Any pane can be zoomed to fill the whole right side with `z`, and `z` again restores it.
- Minimum supported size: 80x24. Below that, show a "terminal too small" message.

### Focus zones
Focus cycles in this order with `tab` / `shift+tab`: **Sidebar → URL bar → Request pane → Response pane**. The focused zone gets a highlighted border. Inside a pane, `[` and `]` switch tabs.

## 3. Sidebar spec

- **Collections section:** each collection is a folder. It expands to show subfolders and requests, and each request row shows a colored method badge (`GET`, `POST`, ...) plus its name.
- **Requests section:** flat list of standalone requests, with the same row format.
- Actions on the selected item:
  - `enter`: open a request, or expand or collapse a folder.
  - `n`: new request (in the current collection, or standalone if the cursor is in the Requests section).
  - `N`: new collection.
  - `r`: rename.
  - `d`: delete, with confirmation.
  - `D`: duplicate.
  - `m`: move a request between a collection and standalone.
- Unsaved changes are marked with a `●` next to the request name.
- `/` filters the sidebar as you type. `ctrl+p` opens a global fuzzy finder across everything.

## 4. Top bar spec

- **Method select:** a dropdown with `GET POST PUT PATCH DELETE HEAD OPTIONS`. Focus it and press `enter` to open, or press `m` to cycle. Each method has its own color.
- **URL input:** single-line text input with:
  - `{{variable}}` highlighting (green if it resolves, red if unknown).
  - Query parameters in the URL stay in sync with the Params tab in both directions.
  - Cursor movement by word, and paste support.
- **Send button:** `enter` while it's focused or `ctrl+enter` from anywhere. While a request is in flight it becomes `Cancel` (`esc`), with a spinner.
- **Environment indicator:** shows the active environment name. `ctrl+e` opens a quick switcher.

## 5. Request pane spec

Tabs:

1. **Params:** key/value table for query params, each row with an enable/disable checkbox.
2. **Headers:** key/value table with enable/disable per row. Common header names autocomplete. `Content-Type` is auto-added when a body type is chosen.
3. **Auth:** type select (None, Bearer, Basic, API Key header) with the matching fields. Values can use `{{variables}}`.
4. **Body:** type select (None, JSON, Raw text, Form URL-encoded, Multipart). The JSON editor validates as you type and shows the error position.
5. **Settings:** timeout, follow redirects, max redirects, and `insecure` TLS toggle.

Editing behavior:
- Table tabs use `a` add row, `x` delete row, `space` toggle row, and `enter` edit cell.
- Multi-line body editing opens an inline editor. `ctrl+o` opens the body in `$EDITOR` and reloads on save.
- `ctrl+s` saves the request to its file.

## 6. Response pane spec

Status line: status code (colored by class), status text, duration, size, and a truncation warning if the body was cut.

Tabs:
1. **Body:** JSON tree viewer for JSON, pretty-printed text for other types, and an image or binary notice with a save option.
2. **Headers:** table of response headers.
3. **Raw:** exact bytes as text, with a toggle for wrapping.
4. **Timeline:** redirect chain, plus DNS, connect, TLS, first byte, and total time.

### JSON tree viewer
- Parse into a tree of nodes (`object`, `array`, `string`, `number`, `bool`, `null`), each with a collapsed state, depth, and JSON path.
- Collapsed nodes show a summary: `▸ user { 4 keys }`, `▸ items [ 120 ]`.
- Color by type: strings green, numbers yellow, keys blue, null grey.
- Search (`/`) matches keys and values, auto-expands ancestors of matches, and shows a `3/17` match counter. `n` / `N` jump between matches.
- Copy the value (`y`), the JSON path (`Y`, e.g. `$.user.address.city`), or the subtree as JSON (`ctrl+y`).
- Large responses stay usable: build the tree lazily and render only visible rows (virtualized list).
- Invalid JSON falls back to the raw view with the parse error position highlighted.
- Empty state before the first send: "Press ctrl+enter to send".

## 7. Core features

### MVP
1. Sidebar with Collections and standalone Requests.
2. Top bar with method select, URL input, and Send.
3. Request pane with Params, Headers, Auth, and Body tabs.
4. Response pane with Body (JSON tree), Headers, and Raw tabs.
5. Async send with spinner, cancel, and timeout.
6. Environments with `{{variable}}` interpolation and a switcher.
7. History: every sent request is logged and can be re-run.
8. Saved auth: bearer, basic, API key header.

### Next
- Copy as curl, and import from curl.
- Request chaining: use a value from one response in a later request (`{{res.login.token}}`).
- Diff two responses.
- XML and HTML pretty-printing.
- Timeline tab with full timing breakdown.
- Export a response body to a file.
- Headless `--run path/to/request.yaml` mode for CI.

## 8. On-disk format

```
my-workspace/
├── curlz.yaml                  # workspace config
├── environments/
│   ├── local.yaml
│   ├── staging.yaml
│   └── production.yaml
├── collections/
│   ├── my-api/
│   │   ├── collection.yaml     # name, optional shared auth/headers/base vars
│   │   ├── auth/
│   │   │   ├── login.yaml
│   │   │   └── refresh.yaml
│   │   └── users/
│   │       ├── list.yaml
│   │       └── create.yaml
│   └── payments/
│       └── ...
├── requests/                   # standalone single requests
│   ├── health-check.yaml
│   └── ping-prod.yaml
└── .curlz/                     # gitignored
    ├── history.jsonl
    └── secrets.yaml
```

**Request file (`collections/my-api/users/create.yaml`):**
```yaml
name: Create user
method: POST
url: "{{base_url}}/users"
headers:
  - { key: Content-Type, value: application/json, enabled: true }
params:
  - { key: notify, value: "true", enabled: true }
auth:
  type: bearer
  token: "{{token}}"
body:
  type: json
  content: |
    { "name": "Ada", "email": "ada@example.com" }
settings:
  timeout_ms: 30000
  follow_redirects: true
```

**Environment file (`environments/local.yaml`):**
```yaml
base_url: http://localhost:3000
token: "{{secret:local_token}}"
```

**Rules**
- Secrets are never in tracked files. `{{secret:name}}` resolves from `.curlz/secrets.yaml` or OS environment variables.
- `.curlz/` is added to `.gitignore` automatically on init.
- Variable precedence: request-level > collection-level > active environment > OS environment.
- Unknown variables are highlighted red and block sending with a clear error.
- Headers and params are lists (not maps) so order and disabled rows are preserved cleanly in diffs.

## 9. Keybindings

**Global**

| Key | Action |
|---|---|
| `tab` / `shift+tab` | Cycle focus zones |
| `ctrl+enter` | Send request |
| `esc` | Cancel in-flight request, or close popup |
| `ctrl+s` | Save request |
| `ctrl+p` | Fuzzy find any request |
| `ctrl+e` | Switch environment |
| `ctrl+b` | Toggle sidebar |
| `ctrl+h` | Open history |
| `ctrl+l` | Focus URL bar |
| `z` | Zoom focused pane |
| `?` | Help |
| `ctrl+q` | Quit |

**Sidebar:** `j/k` move, `enter` open or expand, `n` new request, `N` new collection, `r` rename, `d` delete, `D` duplicate, `m` move, `/` filter.

**Top bar:** `m` cycle method (when method select is focused), `enter` open dropdown or send, arrows and `ctrl+arrows` for text navigation.

**Request pane:** `[` / `]` switch tabs, `a` add row, `x` delete row, `space` toggle row, `enter` edit cell, `ctrl+o` open body in `$EDITOR`.

**Response pane:** `[` / `]` switch tabs, `j/k` move, `enter` or `space` expand or collapse, `E` / `C` expand all or collapse all, `/` search, `n` / `N` next or previous match, `y` copy value, `Y` copy path, `ctrl+y` copy subtree.

## 10. Architecture

```
ui/
  layout        sidebar, top bar, request pane, response pane, focus manager
  components    tabs, key/value table, dropdown, text input, tree view
  keymap        per-zone key bindings
core/
  workspace     load/save collections, standalone requests, environments
  interpolate   {{var}} resolution + secrets
  httpclient    build request, send, cancel, timing
  history       append-only jsonl log
  jsontree      parser, tree model, search
```

**Rule:** `core/` never imports `ui/`. That gives you a headless `--run` mode and lets you test everything without a terminal.

**Data model (pseudo-types):**
```
Workspace { collections: Collection[], requests: Request[], environments: Environment[] }
Collection { name, path, folders, requests, shared? }
Request { name, method, url, headers[], params[], auth, body, settings }
Environment { name, vars: map<string,string> }
Response { status, headers, body_bytes, duration_ms, size, truncated, error? }
HistoryEntry { timestamp, request_path, resolved_request, response_summary }
TreeNode { key, kind, value, children, collapsed, path }
UIState { focus_zone, open_request, active_env, sidebar_width, zoomed_pane? }
```

**Request lifecycle**
1. Load the request file (or the in-memory edited copy).
2. Interpolate variables using the precedence rules above.
3. Validate: URL must exist and all variables must resolve.
4. Send with a context, so it can be cancelled and timed.
5. Capture the response (limit body to about 10 MB and flag truncation).
6. Append to history and render in the response pane.

## 11. Technical requirements

- **Timeouts:** default 30 s, configurable per request.
- **Redirects:** follow up to 10, and show the chain in the Timeline tab.
- **TLS:** verify by default, with a per-request `insecure: true` option for local dev.
- **Compression:** handle gzip and brotli transparently.
- **Redaction:** history logs mask `Authorization` headers and secret values.
- **Resize handling:** the layout reflows live on terminal resize.
- **Cross-platform:** clipboard support on Linux, macOS, and Windows.
- **Startup:** under 100 ms, single binary preferred.

## 12. Stack suggestion

- **Go + Bubble Tea (with Bubbles and Lip Gloss):** single static binary and good HTTP timing via `httptrace`. Best fit for this layout.
- **Python + Textual:** fastest to prototype, with built-in tree, tabs, and layout containers, but a heavier install.
- **Rust + Ratatui:** fast and robust, but the slowest to write.
- **TypeScript + Ink:** familiar, but weak for large scrolling lists.

## 13. Build order

1. **Core first:** workspace loader, interpolation, and HTTP send with timing, tested from a plain `main()`.
2. **JSON tree model and search:** tested with no UI.
3. **Layout shell:** sidebar, top bar, request pane, and response pane as empty boxes with the focus manager and tab cycling.
4. **Sidebar:** load the real workspace, show both sections, and open a request into the other panes.
5. **Top bar and send:** method select, URL input, and Send wired to core, showing the raw response.
6. **Response pane:** status line, Body tree viewer, Headers, and Raw tabs.
7. **Request pane editing:** Params, Headers, Auth, Body tabs, plus save.
8. **Environments and history.**
9. **Polish:** README with a GIF, `.gitignore`, and a push.

**If you're running behind,** cut in this order: in-app request editing (edit files in `$EDITOR` and reload), the history UI, auth types beyond bearer.

## 14. Definition of done

- Open a workspace, see collections and standalone requests in the sidebar, and pick one.
- Change the method or URL in the top bar, hit send, and see the response on the right.
- Browse the JSON response with collapse and search.
- Switching environments changes the resolved URL.
- Secrets never touch tracked files.
- Pushed with a README.
