import type { KeyValueEntry } from "./http";

export interface EnvSet {
  id: string;
  name: string;
  variables: KeyValueEntry[];
}
