const fs = require('fs');
const path = require('path');

function generateTreeAscii(dirPath) {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    items.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    const tree = [];
    tree.push(path.basename(dirPath) || dirPath);

    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const prefix = isLast ? '└── ' : '├── ';
      const suffix = item.isDirectory() ? '/' : '';

      tree.push(prefix + item.name + suffix);
    });

    return tree.join('\n');

  } catch (error) {
    return `Error reading directory: ${error.message}`;
  }
}

function generateTreeRecursive(dirPath, options = {}) {
  let shouldIgnorePath = options.shouldIgnorePath ?? (() => false);
  let prefix = options.prefix ?? '';

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    items.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    const tree = [];

    // Add root directory name only on first call.
    if (prefix === '') {
      tree.push(path.basename(dirPath) || dirPath);
    }

    items.forEach((item, index) => {
      let fullPath = path.join(item.path, item.name);
      if (shouldIgnorePath(fullPath)) return;

      const isLastItem = index === items.length - 1;
      const currentPrefix = isLastItem ? '└── ' : '├── ';
      const suffix = item.isDirectory() ? '/' : '';

      tree.push(prefix + currentPrefix + item.name + suffix);

      // Recursively process subdirectories.
      if (item.isDirectory()) {
        const itemPath = path.join(dirPath, item.name);
        const nextPrefix = prefix + (isLastItem ? '    ' : '│   ');

        try {
          const subtree = generateTreeRecursive(itemPath, { ...options, prefix: nextPrefix });
          tree.push(...subtree);
        } catch (error) {
          // Skip directories we can't read (permissions, etc.).
        }
      }
    });

    return tree;
  } catch (error) {
    return [`Error reading directory: ${error.message}`];
  }
}

function generateTreeAsciiRecursive (dirPath, options = {}) {
  let tree = generateTreeRecursive(dirPath, options);
  return tree.join('\n');
}

module.exports = { generateTreeAscii, generateTreeAsciiRecursive };
