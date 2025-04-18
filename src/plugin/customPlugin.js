export const imageSchema = {
  type: "image",
  position: { x: 0, y: 0 },
  width: 100,
  height: 100,
};

export const imagePlugin = {
  pdf: {
    async draw({ input, page, schema }) {
      if (!input) return;

      const img = await fetch(input).then((res) => res.arrayBuffer());
      const pngImage = await page.doc.embedPng(img);
      const { x, y } = schema.position;
      const { width, height } = schema;

      page.drawImage(pngImage, { x, y, width, height });
    },
  },
  ui: {
    // You can customize the draggable view here if needed
  },
};
