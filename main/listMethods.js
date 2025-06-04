const fs = require('fs');
const path = require('path');

function extractClassesAndMethods(content) {
  const classes = [];
  const classRegex = /(?:export\s+)?class\s+(\w+)\s*{/g;
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    const className = match[1];
    let pos = match.index + match[0].length - 1;
    let braceCount = 1;
    let endPos = pos + 1;

    while (braceCount > 0 && endPos < content.length) {
      if (content[endPos] === '{') braceCount++;
      else if (content[endPos] === '}') braceCount--;
      endPos++;
    }

    const body = content.slice(pos + 1, endPos - 1);

    const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g;
    const methods = [];
    let m;
    while ((m = methodRegex.exec(body)) !== null) {
      if (m[1] !== 'constructor' && m[1] !== 'if' && m[1] !== 'for') {
        methods.push(m[1]);
      }
    }
    classes.push({ className, methods });
  }
  return classes;
}

function extractFunctions(content) {
  const functions = [];
  const exclude = new Set(['if', 'for']);

  const funcDeclRegex = /function\s+(\w+)\s*\([^)]*\)\s*{/g;
  let match;
  while ((match = funcDeclRegex.exec(content)) !== null) {
    if (!exclude.has(match[1])) functions.push(match[1]);
  }

  const varFuncRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:function\s*\([^)]*\)|\([^)]*\)\s*=>)/g;
  while ((match = varFuncRegex.exec(content)) !== null) {
    if (!exclude.has(match[1])) functions.push(match[1]);
  }

  return functions;
}

function scanJsFiles(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const content = fs.readFileSync(fullPath, 'utf8');

    const classes = extractClassesAndMethods(content);
    const functions = extractFunctions(content);

    if (classes.length || functions.length) {
      console.log(`\nArquivo: ${file}`);

      classes.forEach(c => {
        console.log(` Classe: ${c.className}`);
        c.methods.forEach(m => console.log(`  Método: ${m}`));
      });

      functions.forEach(f => console.log(` Função: ${f}`));
    }
  });
}

scanJsFiles('.');
