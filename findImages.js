const fs = require("fs");
const axios = require("axios");

const API_KEY = "I2bxQECbJu7VON2cbQPLceCQevbXhuaxqEyZUgDBY6zjh5jU0GCMMp3W";

const products = fs.readFileSync("urunler.txt", "utf8").split("\n");

async function getImage(productName) {
  try {
    const res = await axios.get("https://api.pexels.com/v1/search", {
      headers: { Authorization: API_KEY },
      params: {
        query: productName,
        per_page: 1
      }
    });

    if (res.data.photos.length > 0) {
      return res.data.photos[0].src.medium;
    }

    return "Görsel bulunamadı";
  } catch (e) {
    return "Hata";
  }
}

async function run() {
  let output = [];

  for (let product of products) {
    if (!product.trim()) continue;

    const name = product.split("-")[0].trim();
    const price = product.split("-")[1]?.trim() || "";

    const image = await getImage(name);

    const line = `${name} - ${price} - ${image}`;
    console.log(line);

    output.push(line);
  }

  fs.writeFileSync("urunler_url.txt", output.join("\n"));
}

run();
