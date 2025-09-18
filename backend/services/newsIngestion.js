import axios from "axios";
import { parseStringPromise } from "xml2js";
import fs from "fs/promises";
import path from "path";
import { generateEmbeddings } from "./embeddingService.js";
import { storeEmbeddings } from "./vectorStore.js";

export class NewsIngestionService {
  constructor() {
    this.newsSources = [
      "https://www.reuters.com/arc/outboundfeeds/rss/?outputType=xml"
    ];
  }

  async loadNewsFromFile() {
    try {
      const filePath = path.join(process.cwd(), "data/news_articles.json");
      const data = await fs.readFile(filePath, "utf8");
      const articles = JSON.parse(data);
      console.log(`Loaded ${articles.length} articles from file`);
      return articles;
    } catch (err) {
      console.error("Error loading news from file:", err);
      return [];
    }
  }

  async ingestNewsFromRSS(rssUrl) {
    try {
      console.log(`Ingesting news from RSS: ${rssUrl}`);
      const response = await axios.get(rssUrl);
      const parsedData = await parseStringPromise(response.data);
      const articles = parsedData.rss.channel[0].item.map((item) => ({
        title: item.title[0],
        content: item.description?.[0] || item.content?.[0] || "",
        link: item.link[0],
        pubDate: item.pubDate[0],
        source: "rss"
      }));
      await this.processAndStoreArticles(articles);
      return { success: true, count: articles.length, source: rssUrl };
    } catch (err) {
      console.error("Error ingesting news from RSS:", err);
      throw err;
    }
  }

  async processAndStoreArticles(articles) {
    const valid = articles.filter((a) => a.content?.length > 50);
    if (!valid.length) return;

    const texts = valid.map((a) => `${a.title}. ${a.content.substring(0, 500)}`);
    const embeddings = await generateEmbeddings(texts);

    const documents = valid.map((a, i) => ({
      content: a.content,
      metadata: {
        title: a.title,
        link: a.link,
        pubDate: a.pubDate,
        source: a.source
      }
    }));

    await storeEmbeddings(documents, embeddings);
    console.log(`Processed and stored ${valid.length} articles`);
  }

  async ingestAllNews() {
    const results = [];
    const fileArticles = await this.loadNewsFromFile();
    if (fileArticles.length) {
      await this.processAndStoreArticles(fileArticles);
      results.push({ success: true, source: "local file", count: fileArticles.length });
    }
    for (const src of this.newsSources) {
      try {
        const result = await this.ingestNewsFromRSS(src);
        results.push(result);
      } catch (err) {
        console.error(`Failed to ingest from ${src}:`, err);
        results.push({ success: false, source: src, error: err.message });
      }
    }
    return results;
  }
}
