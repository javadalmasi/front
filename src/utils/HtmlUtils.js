import DOMPurify from "dompurify";

export const purifyHTML = html => {
    return DOMPurify.sanitize(html);
};

import linkifyHtml from "linkify-html";

export const rewriteDescription = text => {
    // Extract existing links with a regex and replace them with placeholders
    const linkRegex = /<a\s+([^>]*?)>(.*?)<\/a>/gi;
    const placeholders = [];
    let processedText = text;
    let match;
    let index = 0;
    
    // Replace existing links with placeholders to preserve them from linkify
    while ((match = linkRegex.exec(processedText)) !== null) {
        const placeholder = `__EXISTING_LINK_${index}__`;
        placeholders.push(match[0]); // Store the full original link
        processedText = processedText.replace(match[0], placeholder);
        index++;
        linkRegex.lastIndex = 0; // Reset regex index
    }
    
    // Apply linkify to the remaining text
    processedText = linkifyHtml(processedText);
    
    // Restore the original links in their correct positions
    for (let i = 0; i < placeholders.length; i++) {
        processedText = processedText.replace(`__EXISTING_LINK_${i}__`, placeholders[i]);
    }
    
    // Apply other replacements
    processedText = processedText
        .replaceAll(/(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm, "$1")
        .replaceAll(/(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm, "/watch?v=$1")
        .replaceAll("\n", "<br>");
    
    return processedText;
};
