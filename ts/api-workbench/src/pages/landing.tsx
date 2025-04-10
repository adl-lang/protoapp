import { Redirect } from "raviger";
import { workbenchUrl } from "../navigation";

export function Landing() {
  return <Redirect to={workbenchUrl()} />;
}
