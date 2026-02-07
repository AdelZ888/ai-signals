import { discoverTopics } from "./discover-topics.mjs";
import { generatePost } from "./generate-post.mjs";
import { compactQueue } from "./compact-queue.mjs";

await discoverTopics();
try {
  await generatePost();
} finally {
  // Always compact the queue so it does not grow unbounded and retains the right history windows.
  await compactQueue();
}
