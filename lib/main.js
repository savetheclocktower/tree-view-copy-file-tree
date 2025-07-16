const { CompositeDisposable } = require('atom');
const { generateTreeAscii, generateTreeAsciiRecursive } = require('./tree-generator');
class CopyFileTreePackage {
  constructor() {
    this.subs = new CompositeDisposable();
  }

  activate () {
    this.subs.add(
      atom.commands.add('.tree-view li[is="tree-view-directory"]', {
        ['tree-view-copy-file-tree:copy-subtree'](event) {
          let itemPathElement = event.target.closest('[data-path]')
          if (!itemPathElement) return
          let itemPath = itemPathElement.dataset.path;
          let repo = atom.project.getRepositories()?.[0] ?? null;
          let shouldIgnorePath = null;
          if (repo) {
            shouldIgnorePath = (fullPath) => {
              return repo.isPathIgnored(fullPath);
            };
          }
          try {
            let tree = generateTreeAsciiRecursive(itemPath, { shouldIgnorePath });
            atom.clipboard.write(tree);
          } catch (err) {
            atom.notifications.addError('Error generating ASCII tree', {
              detail: err.message
            })
            console.error(err);
          }
        }
      })
    )
  }

  deactivate () {
    this.subs?.dispose();
  }
}

module.exports = new CopyFileTreePackage();
