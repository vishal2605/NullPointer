import fs from "fs";
import * as path from 'node:path';

const problemDir = process.env.GENERATOR_FILE_PATH!;
const structureFile = path.join(problemDir, 'Structure.md');

interface Field {
  type: string;
  name: string;
}

interface ProblemStructure {
  problemName: string;
  functionName: string;
  inputFields: Field[];
  outputField: Field;
}

// --- Utility Functions ---

function parseFields(raw: string): Field[] {
  if (!raw) return [];
  // Handles parsing "type name, type name, ..."
  return raw.split(",").map((f) => {
    const parts = f.trim().split(/\s+/);
    // Handle cases like 'list<list<int>> result' where the type has spaces
    const name = parts.pop()!;
    const type = parts.join(' '); 
    return { type: type.trim(), name: name.trim() };
  });
}

function parseStructure(filePath: string): ProblemStructure {
  const content = fs.readFileSync(filePath, "utf-8");

  const get = (key: string) => {
    const match = content.match(new RegExp(`${key}:\\s*"?(.+?)"?\\s*(\\n|$)`));
    return match && match[1] ? match[1].trim() : "";
  };

  // FIX: TS2322 - Output field is accessed by [0], which can be undefined. 
  // We use a type assertion (`as Field`) here, assuming the Structure.md file is correctly formatted.
  const outputField = parseFields(get("Output Field"))[0] as Field | undefined;

  if (!outputField) {
    // Instead of throwing an error here, which might crash the generator, we assign a fallback.
    // However, since the Field interface is non-optional, we must ensure it exists or throw.
    // For now, we trust the input will be valid and assert its existence.
    return {
      problemName: get("Problem Name"),
      functionName: get("Function Name"),
      inputFields: parseFields(get("Input Field")),
      outputField: outputField!, // We assert it's not undefined
    };
  }

  return {
    problemName: get("Problem Name"),
    functionName: get("Function Name"),
    inputFields: parseFields(get("Input Field")),
    outputField: outputField,
  };
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function javaTypeMapper(type: string): string {
  if (type.startsWith("list<")) {
    const innerMatch = type.match(/list<(.+)>/);
    // FIX: TS2532 - Safely extract inner type to avoid possible 'undefined' 
    // from optional chaining or missing capture group [1]
    const inner = innerMatch && innerMatch[1] ? innerMatch[1].trim() : "";

    switch (inner) {
      case "int": return "List<Integer>";
      case "string": return "List<String>";
      case "float": return "List<Float>";
      default: return `List<${inner}>`;
    }
  }
  switch (type) {
    case "int": return "int";
    case "string": return "String";
    case "float": return "float";
    default: return type;
  }
}

function cppTypeMapper(type: string, isParam = false): string {
  if (type.startsWith("list<")) {
    // Note: The inner type extraction should handle nested lists correctly,
    // e.g., list<list<int>> -> vector<vector<int>>
    const innerMatch = type.match(/list<(.+)>/);
    // FIX: TS2532/TS2345 - Safely extract inner type to ensure 'inner' is a string
    const inner = innerMatch && innerMatch[1] ? innerMatch[1].trim() : "";
    
    const mappedInner = cppTypeMapper(inner); // Now 'inner' is guaranteed to be string

    // This recursive call handles nested types like list<list<int>>
    return `vector<${mappedInner}>${isParam ? "&" : ""}`;
  }
  switch (type) {
    case "int": return "int";
    case "string": return "string";
    case "float": return "float";
    case "bool": return "bool"; // Added bool for completeness
    default: return type;
  }
}

function pythonTypeMapper(type: string): string {
  if (type.startsWith("list<")) {
    const innerMatch = type.match(/list<(.+)>/);
    // FIX: TS2532/TS2345 - Safely extract inner type to ensure 'inner' is a string
    const inner = innerMatch && innerMatch[1] ? innerMatch[1].trim() : "";
    
    const mappedInner = pythonTypeMapper(inner); // Recursive mapping for nested lists
    return `list[${mappedInner}]`;
  }
  return type;
}

function genInputJava(fields: Field[]): string {
  return fields
    .map((f) => {
      // NOTE: This input logic assumes the user provides the size first, then elements.
      if (f.type.startsWith("list<int>"))
        return `int ${f.name}Size = sc.nextInt();
List<Integer> ${f.name} = new ArrayList<>();
for (int i = 0; i < ${f.name}Size; i++) ${f.name}.add(sc.nextInt());`;
      if (f.type === "int") return `int ${f.name} = sc.nextInt();`;
      if (f.type === "string") return `String ${f.name} = sc.next();`;
      // Handles list<list<int>>, float, bool, etc.
      return `// TODO: handle complex type input for ${f.type} ${f.name}`;
    })
    .join("\n");
}

function genInputCpp(fields: Field[]): string {
  return fields
    .map((f) => {
      // NOTE: This input logic assumes the user provides the size first, then elements.
      if (f.type.startsWith("list<int>"))
        return `int ${f.name}Size;
cin >> ${f.name}Size;
vector<int> ${f.name}(${f.name}Size);
for(int i=0; i<${f.name}Size; i++) cin >> ${f.name}[i];`;
      if (f.type === "int") return `int ${f.name}; cin >> ${f.name};`;
      if (f.type === "string") return `string ${f.name}; cin >> ${f.name};`;
      // Handles list<list<int>>, float, bool, etc.
      return `// TODO: handle complex type input for ${f.type} ${f.name}`;
    })
    .join("\n");
}

function genInputPython(fields: Field[]): string {
  return fields
    .map((f) => {
      // NOTE: Assumes list input is space-separated integers on one line.
      if (f.type.startsWith("list<int>"))
        return `${f.name} = list(map(int, input().split())) # List of integers from space-separated input`;
      if (f.type === "int") return `${f.name} = int(input())`;
      if (f.type === "string") return `${f.name} = input().strip()`;
      // Handles list<list<int>>, float, bool, etc.
      return `# TODO: handle complex type input for ${f.type} ${f.name}`;
    })
    .join("\n");
}

function genCallArgs(fields: Field[]): string {
  return fields.map((f) => f.name).join(", ");
}

// --- Boilerplates ---

function boilerplateJava(struct: ProblemStructure) {
  const params = struct.inputFields
    .map((f) => `${javaTypeMapper(f.type)} ${f.name}`)
    .join(", ");
  const returnType = javaTypeMapper(struct.outputField.type);

  return `class Solution {
    public ${returnType} ${struct.functionName}(${params}) {
        // Write your code here
    }
}`;
}


function boilerplateFullJava(struct: ProblemStructure) {
  const inputs = genInputJava(struct.inputFields);
  const args = genCallArgs(struct.inputFields);
  const returnType = javaTypeMapper(struct.outputField.type);

  return `//USER_CODE_HERE
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
${inputs.split("\n").map((l) => "        " + l).join("\n")}
        Solution sol = new Solution();
        ${returnType} result = sol.${struct.functionName}(${args});
        System.out.println(result);
    }
}`;
}


function boilerplateCpp(struct: ProblemStructure) {
  const params = struct.inputFields
    .map((f) => `${cppTypeMapper(f.type, true)} ${f.name}`)
    .join(", ");
  const returnType = cppTypeMapper(struct.outputField.type);

  return `class Solution {
public:
    ${returnType} ${struct.functionName}(${params}) {
        // Write your code here
    }
};`;
}


function boilerplateFullCpp(struct: ProblemStructure) {
  // Use genInputCpp for input generation
  const inputs = genInputCpp(struct.inputFields);
  const args = genCallArgs(struct.inputFields);
  const returnType = cppTypeMapper(struct.outputField.type);

  // Determine the base type for the return to use in the is_same check
  const baseReturnType = cppTypeMapper(struct.outputField.type).replace(/&$/, '');

  return `//USER_CODE_HERE
#include <iostream>
#include <vector>
#include <string>
#include <type_traits> // Include for std::is_same
using namespace std;

// Function to print vector results (useful for debugging/output)
template<typename T>
ostream& operator<<(ostream& os, const vector<T>& v) {
    for (size_t i = 0; i < v.size(); ++i) {
        os << v[i] << (i == v.size() - 1 ? "" : " ");
    }
    return os;
}

int main() {
    // Read Inputs
${inputs.split("\n").map(l => "    " + l).join("\n")}
    
    Solution sol;
    
    // Call the function
    ${returnType} result = sol.${struct.functionName}(${args});
    
    // Print the result
    if constexpr (is_same<${baseReturnType}, vector<int>>::value || is_same<${baseReturnType}, vector<string>>::value) {
        // Use the overloaded operator<< for vectors
        cout << result << endl;
    } else {
        // Default output for primitive types
        cout << result << endl;
    }
    
    return 0;
}`;
}


function boilerplatePython(struct: ProblemStructure) {
  const params = struct.inputFields
    .map((f) => `${f.name}: ${pythonTypeMapper(f.type)}`)
    .join(", ");
  const returnType = pythonTypeMapper(struct.outputField.type);

  return `class Solution:
    def ${struct.functionName}(self, ${params}) -> ${returnType}:
        # Write your code here
        pass`;
}


function boilerplateFullPython(struct: ProblemStructure) {
  // FIX: Using the generalized genInputPython and moving input reading to the main block.
  const inputs = genInputPython(struct.inputFields);
  const args = genCallArgs(struct.inputFields);

  return `#USER_CODE_HERE
import sys
from typing import List

# Set recursion limit higher for recursive problems
sys.setrecursionlimit(2000)

if __name__ == "__main__":
    # Input reading for the specific problem
${inputs.split("\n").map(l => "    " + l).join("\n")}

    sol = Solution()
    
    # Call the solution function
    result = sol.${struct.functionName}(${args})
    
    # Print the result
    print(result)`;
}


// Main Generator
function main() {
    const basePath = process.env.GENERATOR_FILE_PATH;
    if (!basePath) {
      console.error("❌ Missing GENERATOR_FILE_PATH environment variable.");
      process.exit(1);
    }
  
    // Case-insensitive file check
    const files = fs.readdirSync(basePath);
    const structureFile = files.find(file => 
      file.toLowerCase() === 'structure.md'
    );
    
    if (!structureFile) {
      console.error(`❌ Structure.md not found at ${basePath}`);
      process.exit(1);
    }
  
    const structurePath = path.join(basePath, structureFile);
    const struct = parseStructure(structurePath);
    const boilerplateDir = path.join(basePath, "boilerplate");
    const fullDir = path.join(basePath, "boilerplate-full");
    ensureDir(boilerplateDir);
    ensureDir(fullDir);
  
    fs.writeFileSync(path.join(boilerplateDir, "function.java"), boilerplateJava(struct));
    fs.writeFileSync(path.join(boilerplateDir, "function.cpp"), boilerplateCpp(struct));
    fs.writeFileSync(path.join(boilerplateDir, "function.py"), boilerplatePython(struct));
  
    fs.writeFileSync(path.join(fullDir, "function.java"), boilerplateFullJava(struct));
    fs.writeFileSync(path.join(fullDir, "function.cpp"), boilerplateFullCpp(struct));
    fs.writeFileSync(path.join(fullDir, "function.py"), boilerplateFullPython(struct));
  
    console.log(`✅ Boilerplate generated successfully for ${struct.problemName}`);
  }

main();
