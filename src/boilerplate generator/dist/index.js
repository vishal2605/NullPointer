"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("node:path"));
const problemDir = process.env.GENERATOR_FILE_PATH;
const structureFile = path.join(problemDir, 'Structure.md');
// --- Utility Functions ---
function parseFields(raw) {
    if (!raw)
        return [];
    // Handles parsing "type name, type name, ..."
    return raw.split(",").map((f) => {
        const parts = f.trim().split(/\s+/);
        // Handle cases like 'list<list<int>> result' where the type has spaces
        const name = parts.pop();
        const type = parts.join(' ');
        return { type: type.trim(), name: name.trim() };
    });
}
function parseStructure(filePath) {
    const content = fs_1.default.readFileSync(filePath, "utf-8");
    const get = (key) => {
        const match = content.match(new RegExp(`${key}:\\s*"?(.+?)"?\\s*(\\n|$)`));
        return match ? match[1].trim() : "";
    };
    // FIX: TS2322 - Output field is accessed by [0], which can be undefined. 
    // We use a type assertion (`as Field`) here, assuming the Structure.md file is correctly formatted.
    const outputField = parseFields(get("Output Field"))[0];
    if (!outputField) {
        // Instead of throwing an error here, which might crash the generator, we assign a fallback.
        // However, since the Field interface is non-optional, we must ensure it exists or throw.
        // For now, we trust the input will be valid and assert its existence.
        return {
            problemName: get("Problem Name"),
            functionName: get("Function Name"),
            inputFields: parseFields(get("Input Field")),
            outputField: outputField, // We assert it's not undefined
        };
    }
    return {
        problemName: get("Problem Name"),
        functionName: get("Function Name"),
        inputFields: parseFields(get("Input Field")),
        outputField: outputField,
    };
}
function ensureDir(dir) {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
}
function javaTypeMapper(type) {
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
function cppTypeMapper(type, isParam = false) {
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
function pythonTypeMapper(type) {
    if (type.startsWith("list<")) {
        const innerMatch = type.match(/list<(.+)>/);
        // FIX: TS2532/TS2345 - Safely extract inner type to ensure 'inner' is a string
        const inner = innerMatch && innerMatch[1] ? innerMatch[1].trim() : "";
        const mappedInner = pythonTypeMapper(inner); // Recursive mapping for nested lists
        return `list[${mappedInner}]`;
    }
    return type;
}
function genInputJava(fields) {
    return fields
        .map((f) => {
        // NOTE: This input logic assumes the user provides the size first, then elements.
        if (f.type.startsWith("list<int>"))
            return `int ${f.name}Size = sc.nextInt();
List<Integer> ${f.name} = new ArrayList<>();
for (int i = 0; i < ${f.name}Size; i++) ${f.name}.add(sc.nextInt());`;
        if (f.type === "int")
            return `int ${f.name} = sc.nextInt();`;
        if (f.type === "string")
            return `String ${f.name} = sc.next();`;
        // Handles list<list<int>>, float, bool, etc.
        return `// TODO: handle complex type input for ${f.type} ${f.name}`;
    })
        .join("\n");
}
function genInputCpp(fields) {
    return fields
        .map((f) => {
        // NOTE: This input logic assumes the user provides the size first, then elements.
        if (f.type.startsWith("list<int>"))
            return `int ${f.name}Size;
cin >> ${f.name}Size;
vector<int> ${f.name}(${f.name}Size);
for(int i=0; i<${f.name}Size; i++) cin >> ${f.name}[i];`;
        if (f.type === "int")
            return `int ${f.name}; cin >> ${f.name};`;
        if (f.type === "string")
            return `string ${f.name}; cin >> ${f.name};`;
        // Handles list<list<int>>, float, bool, etc.
        return `// TODO: handle complex type input for ${f.type} ${f.name}`;
    })
        .join("\n");
}
function genInputPython(fields) {
    return fields
        .map((f) => {
        // NOTE: Assumes list input is space-separated integers on one line.
        if (f.type.startsWith("list<int>"))
            return `${f.name} = list(map(int, input().split())) # List of integers from space-separated input`;
        if (f.type === "int")
            return `${f.name} = int(input())`;
        if (f.type === "string")
            return `${f.name} = input().strip()`;
        // Handles list<list<int>>, float, bool, etc.
        return `# TODO: handle complex type input for ${f.type} ${f.name}`;
    })
        .join("\n");
}
function genCallArgs(fields) {
    return fields.map((f) => f.name).join(", ");
}
// --- Boilerplates ---
function boilerplateJava(struct) {
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
function boilerplateFullJava(struct) {
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
function boilerplateCpp(struct) {
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
function boilerplateFullCpp(struct) {
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
function boilerplatePython(struct) {
    const params = struct.inputFields
        .map((f) => `${f.name}: ${pythonTypeMapper(f.type)}`)
        .join(", ");
    const returnType = pythonTypeMapper(struct.outputField.type);
    return `class Solution:
    def ${struct.functionName}(self, ${params}) -> ${returnType}:
        # Write your code here
        pass`;
}
function boilerplateFullPython(struct) {
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
    const files = fs_1.default.readdirSync(basePath);
    const structureFile = files.find(file => file.toLowerCase() === 'structure.md');
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
    fs_1.default.writeFileSync(path.join(boilerplateDir, "function.java"), boilerplateJava(struct));
    fs_1.default.writeFileSync(path.join(boilerplateDir, "function.cpp"), boilerplateCpp(struct));
    fs_1.default.writeFileSync(path.join(boilerplateDir, "function.py"), boilerplatePython(struct));
    fs_1.default.writeFileSync(path.join(fullDir, "function.java"), boilerplateFullJava(struct));
    fs_1.default.writeFileSync(path.join(fullDir, "function.cpp"), boilerplateFullCpp(struct));
    fs_1.default.writeFileSync(path.join(fullDir, "function.py"), boilerplateFullPython(struct));
    console.log(`✅ Boilerplate generated successfully for ${struct.problemName}`);
}
main();
//# sourceMappingURL=index.js.map