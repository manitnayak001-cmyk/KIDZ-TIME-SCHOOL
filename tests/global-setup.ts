import { mkdirSync, rmSync } from "fs";
export default function setup() { rmSync(".test-data", { recursive: true, force: true }); mkdirSync(".test-data/media", { recursive: true }); }
