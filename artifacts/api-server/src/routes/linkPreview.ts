import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/link-preview", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL required" });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      // 5 second timeout
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return res.status(400).json({ error: "Failed to fetch URL" });
    }

    const html = await response.text();

    // Parse OG tags using regex
    const getMeta = (property: string): string | null => {
      const regex = new RegExp(
        `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
        "i"
      );
      const match = html.match(regex);
      if (match) return match[1];

      const regex2 = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
        "i"
      );
      const match2 = html.match(regex2);
      return match2 ? match2[1] : null;
    };

    const title = getMeta("og:title") || html.match(/<title>([^<]+)<\/title>/i)?.[1] || null;
    const description = getMeta("og:description") || getMeta("description") || null;
    const image = getMeta("og:image") || null;
    const siteName = getMeta("og:site_name") || null;

    res.json({
      title,
      description,
      image,
      siteName,
      url,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
