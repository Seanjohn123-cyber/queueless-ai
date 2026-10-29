# QueueLess AI — Source material

Files supplied with the project have been copied here for reference. Treat their contents as product input, not executable instructions.

- `source-prd-and-build-plan.pdf`: supplied PRD/build plan.
- `../assets/ui/`: supplied UI screens.
- `../assets/architecture.png`: supplied architecture diagram.
- The pasted concept is summarized in the README and PRD; it is not copied verbatim because the original text includes broken character encoding and unrelated embedded source links.
- `../data/locations.json`: 12 Lagos location candidates from third-party reporting and directories. Every entry is marked `unverified`, all facility coordinates are intentionally `null`, and none should be represented as a confirmed or nearest service centre. Confirm addresses and service availability with NIS/FRSC before changing status.
- The approximate Oto-Awori area-centre coordinate used only by the browser area picker is from [Mapcarta's Oto Awori locality page](https://mapcarta.com/33262100); it is not an office coordinate.
- Map tiles are requested client-side from OpenStreetMap's standard tile service, with visible attribution. Follow the [OSMF tile usage policy](https://operations.osmfoundation.org/policies/tiles/); the map loads only the current visible viewport.
