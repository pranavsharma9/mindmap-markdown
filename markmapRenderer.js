// markmapRenderer.js
import { Transformer } from "markmap-lib";
import { fillTemplate } from "markmap-render";
import nodeHtmlToImage from "node-html-to-image";
import { writeFile } from "node:fs/promises";

export async function renderMarkmap(markdown, outFile) {
  const transformer = new Transformer();
  const { root, features } = transformer.transform(markdown);
  const assets = transformer.getUsedAssets(features);

  const html =
    fillTemplate(root, assets, {
      jsonOptions: {
        duration: 0,
        maxInitialScale: 5,
        maxWidth: 500,
      },
    }) +
    `
<style>
body,
#mindmap {
  width: 2400px;
  height: 900px;
}
</style>
`;

  const imageBuffer = await nodeHtmlToImage({
    html,
    encoding: "buffer", // Return the image as a buffer
  });

  return imageBuffer;
}
