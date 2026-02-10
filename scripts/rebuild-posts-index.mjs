import "./load-env.mjs";

import { rebuildAllPostsIndex } from "./posts-index.mjs";

const { en, fr } = await rebuildAllPostsIndex();

console.log(`[posts-index] rebuilt en=${en.posts.length} fr=${fr.posts.length}`);

