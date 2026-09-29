import { RequestPane } from "../features/request/request-pane";
import { ResponsePane } from "../features/response/response-pane";
import { Sidebar } from "../features/sidebar/sidebar";
import { Url } from "../features/url/url";

export function App() {
  return (
    <box height="100%" flexDirection="row">
      <Sidebar />
      <box flexGrow={1} flexBasis={0} flexDirection="column">
        <Url />
        <box flexGrow={1} flexBasis={0} flexDirection="row">
          <RequestPane />
          <ResponsePane />
        </box>
      </box>
    </box>
  );
}
