
/**
 * toPython.js - Python Boilerplate Generator
 *
 * This script parses a problem structure and generates Python function/class boilerplate code
 * and a main block with robust input/output handling for competitive programming.
 *
 * Features:
 * - Parses function and class signatures from a structured description
 * - Maps types using mapping.json for Python
 * - Generates input code for all standard CP scenarios:
 *   - Multiple primitives (same/mixed types) from a single line
 *   - 1D and 2D lists (with n rows)
 *   - Fallbacks for custom/complex types
 * - Generates output code for primitives, 1D/2D lists
 * - Logs key steps for debugging and traceability
 *
 * Author: [Your Name]
 * Date: 2025-07-31
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mappingPath = path.join(__dirname, "mapping.json");
const typeMapping = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));

function log(msg, ...args) {
  // Simple logger for debugging
  console.log(`[toPython] ${msg}`, ...args);
}

/**
 * Parses a structured problem description into functions and classes.
 * @param {string} structure - The problem structure string
 * @returns {{functions: Array, classes: Array}}
 */
function parseStructure(structure) {
  log('Parsing structure...');
  const lines = structure.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const result = { functions: [], classes: [] };
  let i = 0;
  while (i < lines.length) {
    if (lines[i].startsWith("Function:")) {
      const func = { name: lines[i].split(":")[1].trim(), inputs: [], outputType: null };
      i++;
      while (i < lines.length && (lines[i].startsWith("Input:") || lines[i].startsWith("Output:"))) {
        if (lines[i].startsWith("Input:")) {
          const inputStr = lines[i].replace("Input:", "").trim();
          if (inputStr) {
            inputStr.split(",").forEach(pair => {
              const [type, ...nameParts] = pair.trim().split(" ");
              func.inputs.push({ type, name: nameParts.join(" ") });
            });
          }
        } else if (lines[i].startsWith("Output:")) {
          func.outputType = lines[i].replace("Output:", "").trim();
        }
        i++;
      }
      result.functions.push(func);
      log('Parsed function:', func);
    } else if (lines[i].startsWith("Class:")) {
      const className = lines[i].split(":")[1].trim();
      i++;
      const methods = [];
      while (i < lines.length && lines[i].startsWith("Methods:")) {
        i++;
        while (i < lines.length && lines[i].startsWith("-")) {
          const methodLine = lines[i].replace("-", "").trim();
          const method = { name: methodLine, inputs: [], outputType: null };
          i++;
          while (i < lines.length && (lines[i].startsWith("Input:") || lines[i].startsWith("Output:"))) {
            if (lines[i].startsWith("Input:")) {
              const inputStr = lines[i].replace("Input:", "").trim();
              if (inputStr) {
                inputStr.split(",").forEach(pair => {
                  const [type, ...nameParts] = pair.trim().split(" ");
                  method.inputs.push({ type, name: nameParts.join(" ") });
                });
              }
            } else if (lines[i].startsWith("Output:")) {
              method.outputType = lines[i].replace("Output:", "").trim();
            }
            i++;
          }
          methods.push(method);
          log('Parsed method:', method);
        }
      }
      result.classes.push({ name: className, methods });
      log('Parsed class:', className);
    } else {
      i++;
    }
  }
  log('Parsing complete.');
  return result;
}

/**
 * Maps a type string to its Python equivalent using mapping.json.
 * @param {string} type
 * @returns {string}
 */
function mapType(type) {
  return typeMapping[type]?.python || type;
}

/**
 * Generates a Python function boilerplate.
 * @param {object} func
 * @returns {string}
 */
function generateFunctionBoilerplate(func) {
  log('Generating function boilerplate for', func.name);
  const args = func.inputs.map(inp => inp.name).join(", ");
  return `def ${func.name}(${args}):\n    # Write your code here\n    pass`;
}

/**
 * Generates a Python class boilerplate.
 * @param {object} cls
 * @returns {string}
 */
function generateClassBoilerplate(cls) {
  log('Generating class boilerplate for', cls.name);
  let code = `class ${cls.name}:`;
  if (cls.methods.length === 0) {
    code += `\n    pass`;
  } else {
    cls.methods.forEach(method => {
      const args = ["self"].concat(method.inputs.map(inp => inp.name)).join(", ");
      code += `\n    def ${method.name}(${args}):\n        # Write your code here\n        pass`;
    });
  }
  return code;
}

/**
 * Generates the combined boilerplate for all classes and functions.
 * @param {object} parsed
 * @returns {string}
 */
function generateBoilerplate(parsed) {
  log('Generating combined boilerplate...');
  let code = "";
  parsed.classes.forEach(cls => {
    code += generateClassBoilerplate(cls) + "\n\n";
  });
  parsed.functions.forEach(func => {
    code += generateFunctionBoilerplate(func) + "\n\n";
  });
  return code.trim();
}


// Generate input code for all arguments at once (space-separated)

/**
 * Generates Python input code for all arguments at once (space-separated).
 * Handles primitives, lists, and 2D lists.
 * @param {Array} inputs
 * @returns {string}
 */
function generateInputsBlock(inputs) {
  if (inputs.length === 0) return "";
  const primitives = ["int", "str", "bool", "float"];
  const mappedTypes = inputs.map(inp => mapType(inp.type));
  const allPrimitive = mappedTypes.every(t => primitives.includes(t));
  const allSameType = new Set(mappedTypes).size === 1;
  // Case 1: all primitive, same type, >1
  if (allPrimitive && allSameType && inputs.length > 1) {
    log('Generating input for multiple primitives of same type:', mappedTypes[0]);
    return `    ${inputs.map(i => i.name).join(", ")} = map(${mappedTypes[0]}, input().split())`;
  }
  // Case 2: all primitive, mixed types, >1 (e.g. int a, str b)
  if (allPrimitive && !allSameType && inputs.length > 1) {
    log('Generating input for multiple primitives of mixed types:', mappedTypes);
    let names = inputs.map(i => i.name).join(", ");
    let casts = inputs.map((inp) => `    ${inp.name} = ${mapType(inp.type)}(${inp.name})`).join("\n");
    return `    ${names} = input().split()\n${casts}`;
  }
  // Fallback: one per line
  log('Generating fallback input code for each input.');
  return inputs.map(inp => {
    const type = mapType(inp.type);
    const name = inp.name;
    if (primitives.includes(type)) {
      return `    ${name} = ${type}(input())`;
    }
    if (type.startsWith("List[List[")) {
      // Try to parse 2D list: expect n, m defined before
      return `    ${name} = [list(map(int, input().split())) for _ in range(n)]  # Assumes n rows`;
    }
    if (type.startsWith("List[")) {
      const inner = type.match(/List\[(.*?)\]/)?.[1];
      if (primitives.includes(inner)) {
        return `    ${name} = list(map(${inner}, input().split()))`;
      }
      return `    # TODO: Parse ${name} as ${type}`;
    }
    return `    ${name} = input()  # TODO: Parse as ${type}`;
  }).join("\n");
}

/**
 * Generates Python output code for the given output type.
 * @param {string} outputType
 * @returns {string}
 */
function generateOutputCode(outputType) {
  const type = mapType(outputType);
  if (["int", "str", "bool", "float"].includes(type)) {
    log('Generating output for primitive type:', type);
    return `    print(result)`;
  } else if (type.startsWith("List[List[")) {
    log('Generating output for 2D list:', type);
    return `    for row in result:\n        print(*row)`;
  } else if (type.startsWith("List[")) {
    log('Generating output for 1D list:', type);
    return `    print(*result)`;
  } else {
    log('Generating output for custom/unknown type:', type);
    return `    print(result)  # TODO: Add custom print logic`;
  }
}


/**
 * Generates the full Python boilerplate including imports, main block, and I/O.
 * @param {object} parsed
 * @returns {string}
 */
function generateFullBoilerplate(parsed) {
  log('Generating full boilerplate...');
  let code = "# Imports\n";
  code += "import sys\n\n";
  code += generateBoilerplate(parsed) + "\n\n";
  code += "if __name__ == '__main__':\n";
  let mainFunc = parsed.functions[0] || (parsed.classes[0]?.methods[0]);
  if (mainFunc) {
    code += generateInputsBlock(mainFunc.inputs) + "\n";
    let call;
    if (parsed.functions[0]) {
      call = `${mainFunc.name}(${mainFunc.inputs.map(inp => inp.name).join(", ")})`;
      code += `    result = ${call}\n`;
      code += generateOutputCode(mainFunc.outputType) + "\n";
    } else {
      code += `    obj = ${parsed.classes[0].name}()\n`;
      call = `obj.${mainFunc.name}(${mainFunc.inputs.map(inp => inp.name).join(", ")})`;
      code += `    result = ${call}\n`;
      code += generateOutputCode(mainFunc.outputType) + "\n";
    }
  }
  log('Full boilerplate generated.');
  return code;
}


/**
 * Main export: generates Python boilerplate and full code for a given structure.
 * @param {string} structure
 * @returns {{boilerplate: string, fullBoilerplate: string}}
 */
export function generatePythonBoilerplates(structure) {
  log('Generating Python boilerplates...');
  const parsed = parseStructure(structure);
  const boilerplate = generateBoilerplate(parsed);
  const fullBoilerplate = generateFullBoilerplate(parsed);
  log('Boilerplate and full code generated.');
  return { boilerplate, fullBoilerplate };
}
