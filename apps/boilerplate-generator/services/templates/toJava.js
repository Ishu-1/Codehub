
/**
 * toJava.js - Java Boilerplate Generator
 *
 * This script parses a problem structure and generates Java function/class boilerplate code
 * and a main block with robust input/output handling for competitive programming.
 *
 * Features:
 * - Parses function and class signatures from a structured description
 * - Maps types using mapping.json for Java
 * - Generates input code for all standard CP scenarios:
 *   - Primitives, 1D and 2D lists (with n rows)
 *   - Fallbacks for custom/complex types
 * - Generates output code for primitives, 1D/2D lists
 *
 * Author: [Your Name]
 * Date: 2025-07-31
 */

// =========================
// Imports & Setup
// =========================

import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const mappingPath = path.join(__dirname, "mapping.json");
const typeMapping = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));

function log(msg, ...args) {
  // Simple logger for debugging
  console.log(`[toJava] ${msg}`, ...args);
}

// =========================
// Structure Parsing
// =========================
/**
 * Parses a structured problem description into functions and classes.
 * @param {string} structure - The problem structure string
 * @returns {{functions: Array, classes: Array}}
 */
/**
 * Parses a structured problem description into functions and classes.
 * Logs each parsed function and class.
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
      const func = { name: lines[i].split(":")[1].trim(), inputs: [], output: null };
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
          func.output = lines[i].replace("Output:", "").trim();
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
          const method = { name: methodLine, inputs: [], output: null };
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
              method.output = lines[i].replace("Output:", "").trim();
            }
            i++;
          }
          methods.push(method);
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
 * Maps a type string to its Java equivalent using mapping.json.
 * @param {string} type
 * @returns {string}
 */
// =========================
// Type Mapping
// =========================
/**
 * Maps a type string to its Java equivalent using mapping.json.
 * @param {string} type
 * @returns {string}
 */
function mapType(type) {
  return typeMapping[type]?.java || type;
}

/**
 * Generates a Java function boilerplate.
 * @param {object} func
 * @returns {string}
 */
// =========================
// Boilerplate Generation
// =========================
/**
 * Generates a Java function boilerplate.
 * @param {object} func
 * @returns {string}
 */
function generateFunctionBoilerplate(func) {
  log('Generating function boilerplate for', func.name);
  const args = func.inputs.map(inp => `${mapType(inp.type)} ${inp.name}`).join(", ");
  return `public static ${mapType(func.output)} ${func.name}(${args}) {\n    // Write your code here\n}`;
}

/**
 * Generates a Java class boilerplate.
 * @param {object} cls
 * @returns {string}
 */
/**
 * Generates a Java class boilerplate.
 * @param {object} cls
 * @returns {string}
 */
function generateClassBoilerplate(cls) {
  log('Generating class boilerplate for', cls.name);
  let code = `public class ${cls.name} {`;
  cls.methods.forEach(method => {
    const args = method.inputs.map(inp => `${mapType(inp.type)} ${inp.name}`).join(", ");
    code += `\n    public ${mapType(method.output)} ${method.name}(${args}) {\n        // Write your code here\n    }`;
  });
  code += `\n}`;
  return code;
}

/**
 * Generates the combined boilerplate for all classes and functions.
 * @param {object} parsed
 * @returns {string}
 */
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

/**
 * Generates the full Java boilerplate including imports, main block, and I/O.
 * @param {object} parsed
 * @returns {string}
 */
// =========================
// Full Boilerplate Generation (with main)
// =========================
/**
 * Generates the full Java boilerplate including imports, main block, and I/O.
 * @param {object} parsed
 * @returns {string}
 */
function generateFullBoilerplate(parsed) {
  log('Generating full boilerplate...');
  let imports = [
    "import java.util.*;",
    "import java.io.*;"
  ];
  let code = imports.join("\n") + "\n\n";
  code += "public class Main {\n";

  // Add all functions inside Main class
  parsed.functions.forEach(func => {
    const args = func.inputs.map(inp => `${mapType(inp.type)} ${inp.name}`).join(", ");
    code += `    public static ${mapType(func.output)} ${func.name}(${args}) {\n`;
    code += `        // Write your code here\n`;
    code += `        return null;\n`; // Placeholder return
    code += `    }\n\n`;
  });

  code += "    public static void main(String[] args) throws Exception {\n";
  code += "        Scanner sc = new Scanner(System.in);\n";

  const mainFunc = parsed.functions[0] || (parsed.classes[0]?.methods[0]);

  if (mainFunc) {
    log('Generating input and output code for main function:', mainFunc.name);
    // Input parsing
    let knownSizes = {};
    mainFunc.inputs.forEach(inp => {
      const type = mapType(inp.type);
      const name = inp.name;
      if (type === "int") knownSizes[name] = true;
      code += `        ${generateInputJava(inp, knownSizes)}\n`;
    });

    // Function call
    let call;
    const argsList = mainFunc.inputs.map(inp => inp.name).join(", ");
    if (parsed.functions[0]) {
      call = `${mainFunc.name}(${argsList})`;
    } else {
      code += `        ${parsed.classes[0].name} obj = new ${parsed.classes[0].name}();\n`;
      call = `obj.${mainFunc.name}(${argsList})`;
    }

    const outputType = mapType(mainFunc.output || "void");

    if (outputType.startsWith("List<List<") || outputType.endsWith("[][]")) {
      code += `        var result = ${call};\n`;
      code += `        for (var row : result) {\n`;
      code += `            for (var val : row) {\n`;
      code += `                System.out.print(val + " ");\n`;
      code += `            }\n`;
      code += `            System.out.println();\n`;
      code += `        }\n`;
    } else if (outputType.startsWith("List<") || outputType.endsWith("[]")) {
      code += `        var result = ${call};\n`;
      code += `        for (var val : result) {\n`;
      code += `            System.out.print(val + " ");\n`;
      code += `        }\n`;
      code += `        System.out.println();\n`;
    } else if (outputType !== "void") {
      code += `        System.out.println(${call});\n`;
    } else {
      code += `        ${call};\n`;
    }
  }

  code += "    }\n";
  code += "}\n";

  log('Full boilerplate generated.');
  return code;
}

/**
 * Generates Java input code for a given input variable.
 * Handles primitives, 1D and 2D lists.
 * @param {object} inp
 * @param {object} knownSizes
 * @returns {string}
 */
// =========================
// Input Code Generation
// =========================
/**
 * Generates Java input code for a given input variable.
 * Handles primitives, 1D and 2D lists.
 * @param {object} inp
 * @param {object} knownSizes
 * @returns {string}
 */
function generateInputJava(inp, knownSizes = {}) {
  log('Generating input code for', inp.name, 'of type', inp.type);
  const type = mapType(inp.type);
  const name = inp.name;

  // Primitive Types
  if (type === "int") return `        int ${name} = sc.nextInt();`;
  if (type === "long") return `        long ${name} = sc.nextLong();`;
  if (type === "float") return `        float ${name} = sc.nextFloat();`;
  if (type === "double") return `        double ${name} = sc.nextDouble();`;
  if (type === "String") return `        String ${name} = sc.next();`;
  if (type === "char") return `        char ${name} = sc.next().charAt(0);`;
  if (type === "boolean") return `        boolean ${name} = sc.nextBoolean();`;

  // Handle 2D list
  if (type.startsWith("List<List<")) {
    const match = type.match(/List<List<(.+?)>>/);
    const innerType = match ? match[1] : "Integer";
    const sizeVars = Object.keys(knownSizes);
    const [rowsVar, colsVar] = sizeVars.slice(-2);

    if (!rowsVar || !colsVar) {
      return `// TODO: Missing size variables for ${name}`;
    }

    return (
      `        List<List<${innerType}>> ${name} = new ArrayList<>();\n` +
      `        for (int i = 0; i < ${rowsVar}; i++) {\n` +
      `            List<${innerType}> row = new ArrayList<>();\n` +
      `            for (int j = 0; j < ${colsVar}; j++) {\n` +
      `                row.add(sc.next${capitalize(innerType)}());\n` +
      `            }\n` +
      `            ${name}.add(row);\n` +
      `        }`
    );
  }

  // Handle 1D list
  if (type.startsWith("List<")) {
    const match = type.match(/List<(.+?)>/);
    const innerType = match ? match[1] : "Integer";
    const sizeVar = Object.keys(knownSizes).slice(-1)[0];

    if (!sizeVar) {
      return `// TODO: Missing size variable for ${name}`;
    }

    return (
      `        List<${innerType}> ${name} = new ArrayList<>();\n` +
      `        for (int i = 0; i < ${sizeVar}; i++) {\n` +
      `            ${name}.add(sc.next${capitalize(innerType)}());\n` +
      `        }`
    );
  }

  return `// TODO: Read input for ${name}`;
}

/**
 * Capitalizes the type for Java Scanner method calls.
 * @param {string} str
 * @returns {string}
 */
// =========================
// Utility
// =========================
/**
 * Capitalizes the type for Java Scanner method calls.
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  if (str === "Integer") return "Int";
  if (str === "Double") return "Double";
  if (str === "Long") return "Long";
  if (str === "Float") return "Float";
  if (str === "Character") return "().charAt(0)";
  if (str === "Boolean") return "Boolean";
  if (str === "String") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Main export: generates Java boilerplate and full code for a given structure.
 * @param {string} structure
 * @returns {{boilerplate: string, fullBoilerplate: string}}
 */
// =========================
// Main Export
// =========================
/**
 * Main export: generates Java boilerplate and full code for a given structure.
 * Logs the process.
 * @param {string} structure
 * @returns {{boilerplate: string, fullBoilerplate: string}}
 */
export function generateJavaBoilerplates(structure) {
  log('Generating Java boilerplates...');
  const parsed = parseStructure(structure);
  const boilerplate = generateBoilerplate(parsed);
  const fullBoilerplate = generateFullBoilerplate(parsed);
  log('Boilerplate and full code generated.');
  return { boilerplate, fullBoilerplate };
}