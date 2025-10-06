import express from "express";

import { landingPageHtml } from "./landingPage";
import { executeFatArrow } from "./fatArrow";
import { executeMapExample } from "./mapExample";
import { executeFilterExample } from "./filterExample";
import { executeReduceExample } from "./reduceExample";

const app = express();
const port = 3000;

app.get("/", (_req, res) => {
    res.send(landingPageHtml);
});

app.get("/example/", (_req, res) => {
    res.send(landingPageHtml);
});

app.get("/example/fatArrow/", (_req, res) => {
    executeFatArrow();
    res.send("See console for fat arrow execution results");
});

app.get("/example/map/", (_req, res) => {
    executeMapExample();
    res.send("See console for map execution results");
});

app.get("/example/filter/", (_req, res) => {
    executeFilterExample();
    res.send("See console for filter execution results");
});

app.get("/example/reduce/", (_req, res) => {
    executeReduceExample();
    res.send("See console for reduce execution results");
});

app.listen(port, () => {
    console.log(`Sandbox listening on port ${port}`);
});
