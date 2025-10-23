#!/usr/bin/env node

// Script to fix the corrupted WatchVideo.vue file
import fs from 'fs';

const filePath = './src/components/WatchVideo.vue';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Fixing corrupted WatchVideo.vue file...');

// Replace the corrupted extractedTags function
content = content.replace(
  /extractedTags\(\)[\s\S]*?return \[\.\.\.new Set\(newTags\)\];[\s\S]*?},[\s\S]*?allTags\(\)/,
  `extractedTags() {
            // Extract hashtags from description and return unique tags only
            if (!this.video?.description) return [];

            // Find all /hashtag/ patterns in the description
            const hashtagRegex = /\\/hashtag\\/(\\[^'\"\[\\]s\\?#\\]+)/g;
            let match;
            const newTags = [];
            let description = this.video.description;

            while ((match = hashtagRegex.exec(description)) !== null) {
                let tag = match[1];
                // Decode URL-encoded tags (like %D9%88%D8%A7%D9%84%DA%A9%D8%B3 -> والکس)
                try {
                    tag = decodeURIComponent(tag);
                } catch (e) {
                    // If decoding fails, use the original tag
                    console.warn("Could not decode hashtag:", tag);
                }
                
                if (!this.video.tags?.includes(tag) && !newTags.includes(tag)) {
                    newTags.push(tag);
                }
            }

            return [...new Set(newTags)];
        },
        allTags()`
);

// Replace the corrupted processedDescription function
content = content.replace(
  /processedDescription\(\)[\s\S]*?return processedDesc;[\s\S]*?},[\s\S]*?hasDescription\(\)/,
  `processedDescription() {
            if (!this.video?.description) return "";

            // Extract and remove hashtag links from description
            const hashtagRegex = /\\/hashtag\\/(\\[^'\"\[\\]s\\?#\\]+)/g;
            let processedDesc = this.video.description.replace(hashtagRegex, "");
            // Clean up multiple newlines that may result from removal
            processedDesc = processedDesc.replace(/\\n\\s*\\n/g, "\\n");

            return processedDesc;
        },
        hasDescription()`
);

fs.writeFileSync(filePath, content);
console.log('WatchVideo.vue has been fixed!');
console.log('You can now run pnpm build successfully.');