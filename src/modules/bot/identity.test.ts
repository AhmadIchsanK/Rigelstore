import { describe, expect, it } from "vitest";
import { isTelegramSyntheticEmail, syntheticEmailForTelegram } from "./identity";

describe("identitas Telegram", () => {
  it("email sintetik deterministik per telegram_id", () => {
    expect(syntheticEmailForTelegram(12345)).toBe("tg12345@telegram.rigelstore.local");
    expect(syntheticEmailForTelegram(12345)).toBe(syntheticEmailForTelegram("12345"));
    expect(syntheticEmailForTelegram(1)).not.toBe(syntheticEmailForTelegram(2));
  });

  it("mengenali email jalur Telegram", () => {
    expect(isTelegramSyntheticEmail(syntheticEmailForTelegram(99))).toBe(true);
    expect(isTelegramSyntheticEmail("orang@gmail.com")).toBe(false);
  });
});
