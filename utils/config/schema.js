// utils/config/schema.js
const { z } = require('zod');

const CURRENT_SCHEMA_VERSION = 2;

/**
 * 設定スキーマ (Zod)
 * @typedef {z.infer<typeof configSchema>} Config
 */
const configSchema = z.object({
  star: z.object({
    adminRoleIds: z.array(z.string()).default([]),
    notifyChannelId: z.string().nullable().default(null),
  }).default({}),
  chatgpt: z.object({
    apiKey: z.string().default(''),
    maxTokens: z.number().int().min(1).max(4000).default(150),
    temperature: z.number().min(0).max(1).default(0.7),
    persona: z.string().nullable().default(null),
    model: z.string().default('gpt-3.5-turbo'),
  }).default({}),

  _version: z.number().default(1),
  _updatedAt: z.string().datetime().optional(), // 最終更新日時
}).default({});

module.exports = { configSchema, CURRENT_SCHEMA_VERSION };