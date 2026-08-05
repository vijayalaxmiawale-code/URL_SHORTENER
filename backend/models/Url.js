import mongoose from "mongoose";
import { nanoid } from "nanoid";

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)/.test(v);
        },
        message: "URL must start with http:// or https://",
      },
    },
    shortId: {
      type: String,
      required: true,
      default: () => nanoid(8),
      unique: true,
    },
    // "slug" is the single active lookup field.
    // It holds the customAlias if set, otherwise the shortId.
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    lastVisited: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    analytics: {
      totalClicks: {
        type: Number,
        default: 0,
      },
      uniqueVisitors: {
        type: Number,
        default: 0,
      },
      browsers: {
        type: Map,
        of: Number,
        default: new Map(),
      },
      operatingSystems: {
        type: Map,
        of: Number,
        default: new Map(),
      },
      devices: {
        type: Map,
        of: Number,
        default: new Map(),
      },
      recentVisits: [
        {
          timestamp: {
            type: Date,
            default: Date.now,
          },
          browser: String,
          os: String,
          device: String,
          referrer: String,
        },
      ],
    },
  },
  { timestamps: true }
);

// Compound index for userId and customAlias
urlSchema.index({ userId: 1, customAlias: 1 });
// Index for userId to quickly fetch all user links
urlSchema.index({ userId: 1, createdAt: -1 });

// This keeps slug always up to date when alias is added/removed.
urlSchema.pre("save", function () {
  this.slug = this.customAlias || this.shortId;
});

const Url = mongoose.model("Url", urlSchema);

export default Url;