import { Router, type IRouter } from "express";

const router: IRouter = Router();

const TENOR_API_KEY = process.env.TENOR_API_KEY || "LIVDSRZULELA";
const TENOR_BASE_URL = "https://g.tenor.com/v1";

// Search GIFs
router.get("/gifs/search", async (req, res) => {
  try {
    const { q, limit = "20" } = req.query;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Query required" });
    }

    const url = `${TENOR_BASE_URL}/search?q=${encodeURIComponent(q)}&key=${TENOR_API_KEY}&limit=${limit}&media_filter=minimal`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).json({ error: "Tenor API error" });
    }

    const data: any = await response.json();
    
    // Map to simpler format
    const gifs = data.results?.map((result: any) => ({
      id: result.id,
      url: result.media?.[0]?.gif?.url || result.media?.[0]?.tinygif?.url,
      preview: result.media?.[0]?.tinygif?.url || result.media?.[0]?.gif?.url,
      title: result.title,
    })).filter((g: any) => g.url) || [];

    res.json(gifs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Trending GIFs
router.get("/gifs/trending", async (_req, res) => {
  try {
    const url = `${TENOR_BASE_URL}/trending?key=${TENOR_API_KEY}&limit=20&media_filter=minimal`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).json({ error: "Tenor API error" });
    }

    const data: any = await response.json();
    
    const gifs = data.results?.map((result: any) => ({
      id: result.id,
      url: result.media?.[0]?.gif?.url || result.media?.[0]?.tinygif?.url,
      preview: result.media?.[0]?.tinygif?.url || result.media?.[0]?.gif?.url,
      title: result.title,
    })).filter((g: any) => g.url) || [];

    res.json(gifs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
