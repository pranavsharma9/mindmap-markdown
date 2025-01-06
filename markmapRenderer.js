// markmapRenderer.js
import { Transformer } from "markmap-lib";
import { fillTemplate } from "markmap-render";
import nodeHtmlToImage from "node-html-to-image";
import { writeFile } from "node:fs/promises";

export async function renderMarkmap(markdown, outFile) {
  const transformer = new Transformer();
  const { root, features } = transformer.transform(markdown);
  const assets = transformer.getUsedAssets(features);

  // This is the default HTML for the mindmap
  let html = fillTemplate(root, assets, {
    jsonOptions: {
      duration: 0,
      maxInitialScale: 5,
      maxWidth: 500,
    },
  });

  html += `
<div class="play-overlay">
  <div class="play-button"></div>
</div>
<style>
  /* Make sure the parent is relatively positioned for the overlay */
  body, #mindmap {
    position: relative;
    width: 2400px;
    height: 900px;
    margin: 0;
    padding: 0;
  }

  /* The overlay covers the entire area, sitting above the mindmap */
  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 2400px;
    height: 900px;
    pointer-events: none; /* so clicks pass through if desired */
    z-index: 9999;       /* ensure it's on top */
  }

  /* The circular background for the play button */
  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* The triangular play symbol inside the circle */
  .play-button::before {
    content: '';
    display: block;
    margin-left: 8px;
    width: 0;
    height: 0;
    border-style: solid;
    /* Increased triangle size */
    border-width: 20px 0 20px 35px;
    border-color: transparent transparent transparent #fff;
  }
</style>
`;

  const imageBuffer = await nodeHtmlToImage({
    html,
    encoding: "buffer", // Return the image as a buffer
  });

  return imageBuffer;
}
