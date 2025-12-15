import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
// Try multiple possible locations for .env file
const envPaths = [
    path.join(__dirname, "..", "..", "..", ".env"), // From dist folder to root
    path.join(process.cwd(), ".env"), // From current working directory
    path.resolve(".env"), // Relative to current directory
];

for (const envPath of envPaths) {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
        console.log(`Loaded environment variables from: ${envPath}`);
        break;
    }
}

// Import prisma after environment variables are loaded
const { prisma } = await import("@repo/db");


const app = express();
app.use(cors());
app.use(express.json());

app.post("/npwebhook", async (req, res) => {
  const { testCaseResult, submissionStatus, passedCount, submissionId } = req.body;

  if (!submissionId || !Array.isArray(testCaseResult)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payload",
    });
  }

  try {
    // Fetch all testcases for this submission
    const testcases = await prisma.testcase.findMany({
      where: { submissionId },
    });
    console.log('testcase,',testcases);
    // Prepare all update operations
    const updateOps = testcases.map((tc, index) => {
      const result = testCaseResult[index];
      if (!result) return null;

      return prisma.testcase.update({
        where: { id: tc.id },
        data: {
          status: result.status,
          time: result.time,
          output: result.compile_output ?? result.output ?? "",
        },
      });
    }).filter(Boolean);

    await Promise.all(updateOps);

    console.log('updateOps,',updateOps);
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: submissionStatus,
      },
    });
    console.log('finally');
    return res.json({
      success: true,
      message: "Webhook processed successfully (optimized)",
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));
