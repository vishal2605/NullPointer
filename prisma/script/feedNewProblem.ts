import { prisma } from '../../src/app/lib/db';
import * as fs from 'fs';
import * as path from 'path';


const PROBLEMS_ROOT_DIR = path.join(process.cwd(), 'problems'); 

const LANGUAGES: Array<{ id: number; name: string; ext: string }> = [
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

function getFileContent(problemSlug: string, folderName: string, langExt: string): string {
    const filePath = path.join(
        PROBLEMS_ROOT_DIR, 
        problemSlug, 
        folderName, 
        `${FILE_STRUCTURE.FILE_NAME}.${langExt}`
    );
    return fs.readFileSync(filePath, 'utf8');
}

async function feed(){
    try {
        const problemSlug = fs.readdirSync(PROBLEMS_ROOT_DIR,{withFileTypes: true}).
        filter(dir => dir.isDirectory() && dir.name.startsWith('.')).map(dir => dir.name);

        if(problemSlug.length==0){
            console.log('no problem exist');
            return;
        }
        console.log(problemSlug);
        for(let slug of problemSlug){

            const existingProblem = await prisma.problem.findUnique({
                where: { slug: slug },
                select: { id: true }
              });
            
            if(existingProblem){
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

    } catch (error) {
        
    }
}

feed();