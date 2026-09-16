import { z } from "zod";
import catalogData from "./catalog.json" with { type: "json" };
import { appSchema, releaseSchema } from "./model.ts";
import releaseData from "./releases.json" with { type: "json" };

export const apps = z.array(appSchema).parse(catalogData);
export const releases = z.array(releaseSchema).parse(releaseData);
