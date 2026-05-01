import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

/**
 * Server-side helper to save a base64 or Buffer to local public storage
 */
export async function saveFileLocally(
  data: string | Buffer,
  folder: string = "uploads",
  filenamePrefix: string = "file"
): Promise<string | null> {
  try {
    let buffer: Buffer;
    let ext = "jpg";

    if (typeof data === "string" && data.startsWith("data:image")) {
      // Handle base64 string
      const matches = data.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 string");
      }
      ext = matches[1];
      buffer = Buffer.from(matches[2], "base64");
    } else if (Buffer.isBuffer(data)) {
      buffer = data;
    } else {
      throw new Error("Unsupported data format");
    }

    const filename = `${filenamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const uploadDir = join(process.cwd(), "public", folder);

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the URL pointing to our media API route
    return `/api/media/${folder}/${filename}`;
  } catch (error) {
    console.error("❌ saveFileLocally Error:", error);
    return null;
  }
}
