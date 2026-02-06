import { discoverTopics } from "./discover-topics.mjs";
import { generatePost } from "./generate-post.mjs";

await discoverTopics();
await generatePost();
