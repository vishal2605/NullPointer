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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../../src/app/lib/db");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PROBLEMS_ROOT_DIR = path.join(process.cwd(), 'problems');
const LANGUAGES = [
    { id: 2, name: 'cpp', ext: 'cpp' },
    { id: 1, name: 'java', ext: 'java' },
    { id: 3, name: 'python', ext: 'py' },
];
// Define the structure for reading files within each problem folder.
const FILE_STRUCTURE = {
    CODE_FOLDER: 'boilerplate',
    FULL_CODE_FOLDER: 'boilerplate-full',
    FILE_NAME: 'function', // e.g., boilerplate/function.java
};
function getFileContent(problemSlug, folderName, langExt) {
    const filePath = path.join(PROBLEMS_ROOT_DIR, problemSlug, folderName, `${FILE_STRUCTURE.FILE_NAME}.${langExt}`);
    return fs.readFileSync(filePath, 'utf8');
}
function feed() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const problemSlug = fs.readdirSync(PROBLEMS_ROOT_DIR, { withFileTypes: true }).
                filter(dir => dir.isDirectory() && dir.name.startsWith('.')).map(dir => dir.name);
            if (problemSlug.length == 0) {
                console.log('no problem exist');
                return;
            }
            console.log(problemSlug);
            for (let slug of problemSlug) {
                const existingProblem = yield db_1.prisma.problem.findUnique({
                    where: { slug: slug },
                    select: { id: true }
                });
                if (existingProblem) {
                    console.log(`   ➡️ Problem "${slug}" already exists (ID: ${existingProblem.id}). Skipping.`);
                    continue;
                }
                // await prisma.$transaction(async (tx) =>{
                //     const newProblem = await tx.problem.create({
                //         data:{
                //             slug:slug,
                //             title:
                //         }
                //     })
                // })
            }
        }
        catch (error) {
        }
    });
}
feed();
