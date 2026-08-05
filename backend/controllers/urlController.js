import Url from "../models/Url.js";
import { UAParser } from "ua-parser-js";

const reservedAliases = new Set([
  "admin",
  "login",
  "signup",
  "dashboard",
  "api",
  "auth",
  "user",
  "profile",
]);

// Parse user agent using ua-parser-js
function parseUserAgent(userAgentString = "") {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  return {
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    device: result.device.type || "Desktop",
  };
}


function isReservedAlias(alias) {
  return reservedAliases.has(alias.toLowerCase());
}

// Create Short URL
export const createUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.user.id;

    // Validate original URL
    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL is required" });
    }

    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // Validate and handle custom alias
    let shortId;
    if (customAlias) {
      const alias = customAlias.toLowerCase().trim();

      // Validate alias format
      if (!/^[a-z0-9-]+$/.test(alias)) {
        return res
          .status(400)
          .json({
            message: "Alias must contain only lowercase letters, numbers, and hyphens",
          });
      }

      if (isReservedAlias(alias)) {
        return res
          .status(400)
          .json({ message: "This alias is reserved and cannot be used" });
      }

      // Check if alias is already taken by any existing slug
      const existingAlias = await Url.findOne({ slug: alias });
      if (existingAlias) {
        return res.status(409).json({ message: "This alias is already taken" });
      }

      shortId = alias;
    }

    // Validate and parse expiration date
    let expiresAtDate = null;
    if (expiresAt) {
      expiresAtDate = new Date(expiresAt);
      if (isNaN(expiresAtDate) || expiresAtDate <= new Date()) {
        return res
          .status(400)
          .json({ message: "Expiration date must be in the future" });
      }
    }

    // Create URL document
    const urlData = {
      userId,
      originalUrl,
      expiresAt: expiresAtDate,
    };

    if (shortId) {
      urlData.customAlias = shortId;
      urlData.shortId = shortId;
    }

    const urlDoc = new Url(urlData);

    await urlDoc.save();

    res.status(201).json({
      message: "Short URL created successfully",
      data: {
        id: urlDoc._id,
        originalUrl: urlDoc.originalUrl,
        shortUrl: `${process.env.BASE_URL}/${urlDoc.shortId}`,
        shortId: urlDoc.shortId,
        customAlias: urlDoc.customAlias,
        expiresAt: urlDoc.expiresAt,
        createdAt: urlDoc.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating URL:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get User Links
export const getUserLinks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, sort = "-createdAt" } = req.query;

    const links = await Url.find({ userId })
      .sort(sort)
      .limit(parseInt(limit));

    res.status(200).json({
      count: links.length,
      data: links.map((link) => ({
        _id: link._id,
        originalUrl: link.originalUrl,
        shortUrl: `${process.env.BASE_URL}/${link.shortId}`,
        shortId: link.shortId,
        customAlias: link.customAlias,
        analytics: link.analytics?.recentVisits || [],
        expiresAt: link.expiresAt,
        isActive: link.isActive,
        isExpired: Boolean(link.expiresAt && link.expiresAt <= new Date()),
        createdAt: link.createdAt,
        lastVisited: link.lastVisited,
      })),
    });
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete URL
export const deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const url = await Url.findOneAndDelete({ _id: id, userId });

    if (!url) {
      return res
        .status(404)
        .json({ message: "URL not found or you don't have permission to delete it" });
    }

    res.status(200).json({ message: "URL deleted successfully" });
  } catch (error) {
    console.error("Error deleting URL:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update URL (edit alias and expiration)
export const updateUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { customAlias, expiresAt } = req.body;

    const url = await Url.findOne({ _id: id, userId });

    if (!url) {
      return res.status(404).json({ message: "URL not found or unauthorized" });
    }

    // Update alias if provided
    if (customAlias !== undefined) {
      const alias = customAlias.toLowerCase().trim();

      if (!/^[a-z0-9-]+$/.test(alias)) {
        return res
          .status(400)
          .json({
            message: "Alias must contain only lowercase letters, numbers, and hyphens",
          });
      }

      if (isReservedAlias(alias)) {
        return res
          .status(400)
          .json({ message: "This alias is reserved and cannot be used" });
      }

      // Check if new alias is already taken by another URL (including shortIds)
      const existingAlias = await Url.findOne({
        slug: alias,
        _id: { $ne: id },
      });
      if (existingAlias) {
        return res.status(409).json({ message: "This alias is already taken" });
      }

      url.customAlias = alias;
    }

    // Update expiration if provided
    if (expiresAt !== undefined) {
      if (expiresAt) {
        const newDate = new Date(expiresAt);
        if (isNaN(newDate) || newDate <= new Date()) {
          return res
            .status(400)
            .json({ message: "Expiration date must be in the future" });
        }
        url.expiresAt = newDate;
      } else {
        url.expiresAt = null;
      }
    }

    await url.save();

    res.status(200).json({
      message: "URL updated successfully",
      data: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
        shortId: url.shortId,
        customAlias: url.customAlias,
        expiresAt: url.expiresAt,
        updatedAt: url.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating URL:", error);
    res.status(500).json({ message: error.message });
  }
};

// Toggle URL active status
export const toggleUrlActive = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const url = await Url.findOne({ _id: id, userId });

    if (!url) {
      return res.status(404).json({ message: "URL not found or unauthorized" });
    }

    url.isActive = !url.isActive;
    await url.save();

    res.status(200).json({
      message: `Link ${url.isActive ? "activated" : "deactivated"} successfully`,
      data: {
        id: url._id,
        isActive: url.isActive,
      },
    });
  } catch (error) {
    console.error("Error toggling URL status:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get URL Analytics
export const getUrlAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const url = await Url.findOne({ _id: id, userId });

    if (!url) {
      return res.status(404).json({ message: "URL not found or unauthorized" });
    }

    // Check if expired
    const isExpired = url.expiresAt && url.expiresAt <= new Date();

    res.status(200).json({
      data: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
        shortId: url.shortId,
        customAlias: url.customAlias,
        expiresAt: url.expiresAt,
        isExpired,
        createdAt: url.createdAt,
        analytics: {
          totalClicks: url.clicks,
          lastVisited: url.lastVisited,
          browsers: Object.fromEntries(url.analytics.browsers || []),
          operatingSystems: Object.fromEntries(
            url.analytics.operatingSystems || []
          ),
          devices: Object.fromEntries(url.analytics.devices || []),
          recentVisits: url.analytics.recentVisits.slice(-100).reverse(),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: error.message });
  }
};

// Redirect URL and track analytics
export const redirectUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const now = new Date();

    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    });

    //  slug = customAlias if set, else shortId
    const url = await Url.findOne({ slug: shortId });

    if (!url) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Not Found</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { max-width: 440px; padding: 32px; border-radius: 24px; background: #ffffff; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12); }
              .title { font-size: 28px; font-weight: 700; margin: 0 0 12px; }
              p { margin: 0 0 16px; color: #475569; }
              a { display: inline-block; padding: 12px 20px; border-radius: 999px; background: #2563eb; color: #fff; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1 class="title">Link Not Found</h1>
              <p>The short URL you're looking for doesn't exist.</p>
              <a href="${process.env.FRONTEND_URL}">Go to Home</a>
            </div>
          </body>
        </html>
      `);
    }

    // Check if link is manually deactivated
    if (!url.isActive) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Disabled</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { max-width: 440px; padding: 32px; border-radius: 24px; background: #ffffff; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12); }
              .title { font-size: 28px; font-weight: 700; margin: 0 0 12px; }
              p { margin: 0 0 16px; color: #475569; }
              a { display: inline-block; padding: 12px 20px; border-radius: 999px; background: #2563eb; color: #fff; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1 class="title">Link Disabled</h1>
              <p>This short link has been turned off by its owner.</p>
              <a href="${process.env.FRONTEND_URL}">Go to Home</a>
            </div>
          </body>
        </html>
      `);
    }

    // Check if link is expired
    if (url.expiresAt && url.expiresAt <= now) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Expired</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { max-width: 440px; padding: 32px; border-radius: 24px; background: #ffffff; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12); }
              .title { font-size: 28px; font-weight: 700; margin: 0 0 12px; }
              p { margin: 0 0 16px; color: #475569; }
              a { display: inline-block; padding: 12px 20px; border-radius: 999px; background: #2563eb; color: #fff; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1 class="title">Link Expired</h1>
              <p>This short link is no longer active.</p>
              <a href="${process.env.FRONTEND_URL}">Create a new link</a>
            </div>
          </body>
        </html>
      `);
    }

    // Parse user agent
    const userAgent = req.headers["user-agent"] || "";
    const { browser, os, device } = parseUserAgent(userAgent);

    // Redirect to original URL
    res.redirect(url.originalUrl);

    await Url.findByIdAndUpdate(url._id, {
      $inc: {
        clicks: 1,                    // FIX 2: atomic increment
        "analytics.totalClicks": 1,   // FIX 2: keep totalClicks in sync atomically
      },
      $set: {
        lastVisited: now,
        // FIX 2: atomic Map increments for browser/os/device analytics.
        // We use dot-notation to target the specific Map key being incremented.
        [`analytics.browsers.${browser}`]:
          (url.analytics.browsers.get(browser) || 0) + 1,
        [`analytics.operatingSystems.${os}`]:
          (url.analytics.operatingSystems.get(os) || 0) + 1,
        [`analytics.devices.${device}`]:
          (url.analytics.devices.get(device) || 0) + 1,
      },
      $push: {
        // FIX 3: atomic push + trim in one operation
        "analytics.recentVisits": {
          $each: [{ timestamp: now, browser, os, device, referrer: req.headers.referer || null }],
          $slice: -100, // keep only the most recent 100 — MongoDB enforces this atomically
        },
      },
    });  
 } catch (error) {
    console.error("Error redirecting URL:", error);
     if (!res.headersSent) {
      res.status(500).send("Server error");
    }
  }
};
