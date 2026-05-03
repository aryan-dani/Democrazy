/** @param {import('node:http').ServerResponse | import('http').ServerResponse} res */
export function setDemocrazyCorsHeaders(res) {
  const v =
    typeof process.env.DEMOCRAZY_CORS_ORIGIN === "string"
      ? process.env.DEMOCRAZY_CORS_ORIGIN.trim()
      : "";
  const origin = v || "*";

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
