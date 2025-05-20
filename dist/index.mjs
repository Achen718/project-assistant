import {
  AIChatComponent_default,
  ChatInput_default,
  MessageItem_default,
  MessageList_default,
  createAIAssistant
} from "./chunk-OPWMFSEE.mjs";

// src/lib/analyzer/index.ts
import fs2 from "fs";
import fsPromises from "fs/promises";
import path2 from "path";

// src/lib/analyzer/package-analyzer.ts
var TECH_CATEGORIES = {
  react: { type: "framework", usage: "core", confidence: 1 },
  next: { type: "framework", usage: "core", confidence: 1 },
  vue: { type: "framework", usage: "core", confidence: 1 },
  angular: { type: "framework", usage: "core", confidence: 1 },
  typescript: { type: "language", usage: "core", confidence: 1 },
  tailwindcss: { type: "library", usage: "core", confidence: 1 },
  firebase: { type: "database", usage: "core", confidence: 1 },
  "firebase-admin": { type: "library", usage: "core", confidence: 1 },
  jest: { type: "tool", usage: "development", confidence: 0.9 },
  "@testing-library": {
    type: "library",
    usage: "development",
    confidence: 0.9
  },
  eslint: { type: "tool", usage: "development", confidence: 0.9 },
  prettier: { type: "tool", usage: "development", confidence: 0.9 },
  // Added Prettier
  tsup: { type: "tool", usage: "development", confidence: 0.9 },
  zod: { type: "library", usage: "core", confidence: 1 },
  ai: { type: "library", usage: "core", confidence: 1 },
  // Vercel AI SDK (general)
  "@ai-sdk/react": { type: "library", usage: "core", confidence: 1 },
  // Vercel AI SDK for React
  "@ai-sdk/openai": { type: "library", usage: "core", confidence: 1 },
  // Vercel AI SDK for OpenAI
  langchain: { type: "library", usage: "core", confidence: 1 },
  // Langchain (general)
  "@langchain/core": { type: "library", usage: "core", confidence: 1 },
  "@langchain/openai": { type: "library", usage: "core", confidence: 1 },
  axios: { type: "library", usage: "core", confidence: 1 },
  zustand: { type: "library", usage: "core", confidence: 1 },
  "@radix-ui": { type: "library", usage: "core", confidence: 1 },
  "class-variance-authority": {
    type: "library",
    usage: "core",
    confidence: 1
  },
  // Often with Shadcn
  "lucide-react": { type: "library", usage: "core", confidence: 1 },
  // Often with Shadcn
  clsx: { type: "library", usage: "core", confidence: 1 },
  "tailwind-merge": { type: "library", usage: "core", confidence: 1 },
  // Often with Shadcn
  "@heroicons": { type: "library", usage: "core", confidence: 1 }
};
function analyzePackageJson(packageJson) {
  var _a2, _b, _c, _d;
  if (!packageJson) return { technologies: [] };
  const projectName = packageJson.name;
  const technologies = [];
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies
  };
  if (((_a2 = packageJson.devDependencies) == null ? void 0 : _a2.typescript) || ((_b = packageJson.dependencies) == null ? void 0 : _b.typescript)) {
    technologies.push({
      name: "TypeScript",
      version: allDependencies.typescript,
      type: "language",
      usage: "core",
      confidence: TECH_CATEGORIES.typescript.confidence || 1
    });
  }
  technologies.push({
    name: "JavaScript",
    type: "language",
    usage: "core",
    confidence: 1
    // JS is fundamental
  });
  for (const [depName, version] of Object.entries(allDependencies)) {
    const matchedTechEntry = Object.entries(TECH_CATEGORIES).find(
      ([techKey]) => {
        return depName.toLowerCase() === techKey.toLowerCase() || // Exact match (case-insensitive)
        depName.toLowerCase().startsWith(techKey.toLowerCase() + "-") || // e.g., framework-specific-plugin
        depName.toLowerCase().startsWith("@" + techKey.toLowerCase() + "/");
      }
    );
    if (matchedTechEntry) {
      const [techKey, categoryDetails] = matchedTechEntry;
      const properName = getProperTechName(depName, techKey);
      if (technologies.some(
        (t) => t.name.toLowerCase() === properName.toLowerCase()
      )) {
        continue;
      }
      technologies.push({
        name: properName,
        version,
        type: categoryDetails.type,
        usage: categoryDetails.usage,
        confidence: categoryDetails.confidence || 0.9
        // Default confidence for matched tech
      });
    } else {
      const isSubPackage = technologies.some(
        (tech) => depName.startsWith(tech.name.toLowerCase())
      );
      if (isSubPackage) continue;
      technologies.push({
        name: getProperTechName(depName),
        // Get a capitalized name
        version,
        type: ((_c = packageJson.devDependencies) == null ? void 0 : _c[depName]) ? "tool" : "library",
        usage: ((_d = packageJson.devDependencies) == null ? void 0 : _d[depName]) ? "development" : "core",
        confidence: 0.6
        // Lower confidence for unknown/guessed tech
      });
    }
  }
  const reactTech = technologies.find((t) => t.name.toLowerCase() === "react");
  if (reactTech && reactTech.version) {
    const isReactModern = reactTech.version.startsWith("18") || reactTech.version.startsWith("^18") || reactTech.version.startsWith("~18") || reactTech.version.startsWith("19") || reactTech.version.startsWith("^19") || reactTech.version.startsWith("~19");
    if (isReactModern) {
      reactTech.name = "React (Modern)";
    }
  }
  const nextTech = technologies.find((t) => t.name.toLowerCase() === "next.js");
  if (nextTech && nextTech.version) {
    const isNextModern = nextTech.version.startsWith("13") || nextTech.version.startsWith("^13") || nextTech.version.startsWith("~13") || nextTech.version.startsWith("14") || nextTech.version.startsWith("^14") || nextTech.version.startsWith("~14") || nextTech.version.startsWith("15") || nextTech.version.startsWith("^15") || nextTech.version.startsWith("~15");
    if (isNextModern) {
      nextTech.name = "Next.js (Modern)";
    }
  }
  return { projectName, technologies };
}
function getProperTechName(depName, techKey) {
  if (techKey && TECH_CATEGORIES[techKey]) {
    if (depName.startsWith("@") && techKey.startsWith("@")) {
      const baseKeyName = Object.keys(TECH_SPECIAL_NAMES).find(
        (k) => techKey.toLowerCase() === k.toLowerCase()
      );
      if (baseKeyName) return TECH_SPECIAL_NAMES[baseKeyName];
      return capitalizeFirstLetter(techKey.substring(1).split("/")[0]);
    }
    const specialNameKey = Object.keys(TECH_SPECIAL_NAMES).find(
      (k) => techKey.toLowerCase() === k.toLowerCase()
    );
    if (specialNameKey) return TECH_SPECIAL_NAMES[specialNameKey];
    return capitalizeFirstLetter(techKey);
  }
  if (depName.startsWith("@")) {
    const parts = depName.substring(1).split("/");
    const namespace = capitalizeFirstLetter(parts[0]);
    const packageName = parts[1] ? capitalizeFirstLetter(parts[1]) : "";
    if (packageName) return `${namespace} ${packageName}`;
    return namespace;
  }
  const specialNameKeyFromDep = Object.keys(TECH_SPECIAL_NAMES).find(
    (k) => depName.toLowerCase() === k.toLowerCase()
  );
  if (specialNameKeyFromDep) {
    return TECH_SPECIAL_NAMES[specialNameKeyFromDep];
  }
  return depName.split("-").map((part) => capitalizeFirstLetter(part)).join(" ");
}
var TECH_SPECIAL_NAMES = {
  react: "React",
  next: "Next.js",
  vue: "Vue.js",
  // Added .js for consistency
  angular: "Angular",
  typescript: "TypeScript",
  tailwindcss: "Tailwind CSS",
  firebase: "Firebase",
  "firebase-admin": "Firebase Admin",
  eslint: "ESLint",
  prettier: "Prettier",
  jest: "Jest",
  tsup: "TSup",
  // Capitalized
  zod: "Zod",
  ai: "Vercel AI SDK",
  // More descriptive
  "@ai-sdk/react": "Vercel AI SDK (React)",
  "@ai-sdk/openai": "Vercel AI SDK (OpenAI)",
  langchain: "Langchain",
  "@langchain/core": "Langchain Core",
  "@langchain/openai": "Langchain OpenAI",
  axios: "Axios",
  zustand: "Zustand",
  "@radix-ui": "Radix UI",
  // Base name for Radix
  "class-variance-authority": "Class Variance Authority",
  "lucide-react": "Lucide React",
  clsx: "clsx",
  // Often kept lowercase
  "tailwind-merge": "Tailwind Merge",
  "@heroicons": "Heroicons"
  // Add more as needed
};
function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// src/lib/analyzer/file-structure-analyzer.ts
var KNOWN_CONFIG_FILES = [
  "next.config.js",
  "next.config.mjs",
  "tailwind.config.js",
  "tailwind.config.ts",
  "postcss.config.js",
  "tsconfig.json",
  "jsconfig.json",
  ".eslintrc.json",
  ".eslintrc.js",
  ".eslint.config.js",
  ".prettierrc.json",
  ".prettierrc.js",
  ".prettier.config.js",
  "components.json",
  "vite.config.ts",
  "vite.config.js",
  "webpack.config.js"
];
var KNOWN_ENTRY_POINT_BASENAMES = [
  "index.ts",
  "index.tsx",
  "index.js",
  "index.jsx",
  "main.ts",
  "main.tsx",
  "main.js",
  "main.jsx",
  "App.ts",
  "App.tsx",
  "App.jsx",
  "app.ts",
  "app.tsx",
  "app.jsx",
  "server.ts",
  "server.js"
];
function analyzeFileStructure(allProjectFiles) {
  const result = {
    fileStructure: {
      directories: [],
      commonDirs: [],
      entryPoints: [],
      configFiles: []
    },
    architecturalPatterns: [],
    codePatterns: []
  };
  if (!allProjectFiles || allProjectFiles.length === 0) {
    return result;
  }
  const uniqueRelativeDirs = /* @__PURE__ */ new Set();
  allProjectFiles.forEach((filePath) => {
    const normalizedPath = filePath.replace(/\\/g, "/");
    const parts = normalizedPath.split("/");
    if (parts.length > 1) {
      parts.pop();
      let currentPath = "";
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        uniqueRelativeDirs.add(currentPath);
      }
    }
    const baseName = parts.pop() || normalizedPath;
    if (KNOWN_CONFIG_FILES.includes(baseName)) {
      result.fileStructure.configFiles.push(normalizedPath);
    }
    if (KNOWN_ENTRY_POINT_BASENAMES.includes(baseName)) {
      const dirName = parts.join("/");
      if (dirName === "" || dirName === "src" || dirName === "app" || dirName === "pages") {
        result.fileStructure.entryPoints.push(normalizedPath);
      }
    }
  });
  const allDirs = Array.from(uniqueRelativeDirs);
  result.fileStructure.directories = allDirs.filter(
    (dir) => !dir.includes("/")
  );
  const commonDirNames = [
    "src",
    "components",
    "lib",
    "utils",
    "hooks",
    "api",
    "server",
    "styles",
    "public",
    "app",
    "pages",
    "features"
  ];
  result.fileStructure.commonDirs = allDirs.filter((dir) => {
    const dirBaseName = dir.split("/").pop();
    return dirBaseName && commonDirNames.includes(dirBaseName);
  });
  result.architecturalPatterns = detectArchitecturalPatterns(
    allProjectFiles,
    allDirs
  );
  result.codePatterns = detectCodePatterns(allProjectFiles, allDirs);
  return result;
}
function detectArchitecturalPatterns(allFiles, allDirs) {
  const patterns = [];
  const hasDir = (dirName) => allDirs.some((d) => d === dirName || d.startsWith(dirName + "/"));
  const fileExists2 = (filePath) => allFiles.includes(filePath.replace(/\\/g, "/"));
  if (hasDir("app") && (fileExists2("app/layout.tsx") || fileExists2("app/layout.jsx") || fileExists2("app/layout.ts") || fileExists2("app/layout.js"))) {
    patterns.push({
      name: "Next.js App Router",
      description: "Modern Next.js routing system using app directory with nested layouts and server components.",
      components: [
        "app/layout.tsx (or .jsx, .ts, .js)",
        "app/page.tsx (or .jsx, .ts, .js)"
      ],
      locations: ["app/"]
    });
  }
  if (hasDir("pages") && (fileExists2("pages/_app.tsx") || fileExists2("pages/_app.jsx") || fileExists2("pages/_document.tsx") || fileExists2("pages/_document.jsx"))) {
    if (!patterns.some(
      (p) => p.name === "Next.js App Router" && hasDir("pages/api") && !hasDir("pages/[...slug].tsx")
    )) {
      patterns.push({
        name: "Next.js Pages Router",
        description: "Traditional Next.js routing system using pages directory.",
        components: ["pages/_app.tsx (or .jsx)", "pages/index.tsx (or .jsx)"],
        locations: ["pages/"]
      });
    }
  }
  if (hasDir("src") && allFiles.some((f) => f.startsWith("src/"))) {
    patterns.push({
      name: "Source Directory Layout (src)",
      description: 'Project source code is organized under a top-level "src" directory.',
      locations: ["src/"]
    });
  }
  if (hasDir("components")) {
    patterns.push({
      name: "Component-Based Architecture",
      description: 'UI is built using a modular, component-based approach. Common directory "components" found.',
      components: ["components/*"],
      locations: ["components/"]
    });
  }
  if (hasDir("packages") || hasDir("libs")) {
    patterns.push({
      name: "Monorepo Structure (Potential)",
      description: 'Project may be a monorepo, indicated by "packages" or "libs" directory.',
      locations: ["packages/", "libs/"]
    });
  }
  const hasAppApi = hasDir("app/api");
  const hasPagesApi = hasDir("pages/api");
  const hasSrcApi = hasDir("src/api") || hasDir("src/pages/api") || hasDir("src/app/api");
  if (hasAppApi || hasPagesApi || hasSrcApi) {
    const locations = [];
    if (hasAppApi) locations.push("app/api/");
    if (hasPagesApi) locations.push("pages/api/");
    if (hasSrcApi && !hasAppApi && !hasPagesApi) {
      if (hasDir("src/app/api")) locations.push("src/app/api/");
      else if (hasDir("src/pages/api")) locations.push("src/pages/api/");
      else if (hasDir("src/api")) locations.push("src/api/");
    }
    if (locations.length > 0) {
      patterns.push({
        name: "API Routes Structure",
        description: "Backend API endpoints are likely defined within the project structure.",
        components: locations.map((loc) => `${loc}*`),
        locations
      });
    }
  }
  return patterns;
}
function detectCodePatterns(allFiles, allDirs) {
  const patterns = [];
  const hasDir = (dirName) => allDirs.some((d) => d === dirName || d.startsWith(dirName + "/"));
  const fileExistsInDir = (dirName, partialFilePath) => allFiles.some((f) => f.startsWith(`${dirName}/${partialFilePath}`));
  const dirContainsFileMatching = (dirName, regex) => allFiles.some(
    (f) => f.startsWith(dirName + "/") && regex.test(f.split("/").pop() || "")
  );
  if (hasDir("hooks") || hasDir("src/hooks") || dirContainsFileMatching("lib", /^use[A-Z].*\.(ts|tsx|js|jsx)$/) || dirContainsFileMatching("utils", /^use[A-Z].*\.(ts|tsx|js|jsx)$/)) {
    patterns.push({
      name: "Custom Hooks",
      description: 'React custom hooks for reusable stateful logic (e.g., files starting with "use" in "hooks", "lib" or "utils" directories).',
      examples: ["useAuth", "useForm", "useLocalStorage"],
      locations: ["hooks/", "src/hooks/", "lib/", "utils/"]
    });
  }
  if (hasDir("components/ui") || hasDir("src/components/ui") && fileExistsInDir(
    hasDir("src/components/ui") ? "src/components/ui" : "components/ui",
    "button."
  )) {
    patterns.push({
      name: "Shadcn/UI Components",
      description: "Reusable UI components structured similarly to shadcn/ui, often using Radix UI and Tailwind CSS.",
      examples: ["Button", "Card", "Dialog (found in components/ui)"],
      locations: [
        hasDir("src/components/ui") ? "src/components/ui/" : "components/ui/"
      ]
    });
  }
  if (hasDir("store") || hasDir("stores") || hasDir("src/store") || hasDir("src/stores") || fileExistsInDir("lib", "store.") || fileExistsInDir("app", "store.")) {
    patterns.push({
      name: "Centralized State Management (Potential)",
      description: 'Indicates use of a state management library (e.g., Zustand, Redux, Jotai) by presence of "store(s)" directory or store files.',
      locations: ["store/", "stores/", "src/store/", "src/stores/"]
    });
  }
  if (hasDir("context") || hasDir("contexts") || hasDir("src/context") || hasDir("src/contexts")) {
    patterns.push({
      name: "React Context API Usage",
      description: 'Indicates usage of React Context API for state sharing, suggested by "context(s)" directory.',
      locations: ["context/", "contexts/", "src/context/", "src/contexts/"]
    });
  }
  if (hasDir("utils") || hasDir("src/utils") || hasDir("lib") || hasDir("src/lib")) {
    patterns.push({
      name: "Utility Modules",
      description: 'Project contains utility functions/modules, often in "utils" or "lib" directories.',
      locations: ["utils/", "src/utils/", "lib/", "src/lib/"]
    });
  }
  if (hasDir("locales") || hasDir("src/locales") || hasDir("i18n") || hasDir("src/i18n") || allFiles.some((f) => f.includes("i18n"))) {
    patterns.push({
      name: "Internationalization (i18n) Structure",
      description: 'Project may support multiple languages, indicated by "locales" or "i18n" directories or file names.',
      locations: ["locales/", "src/locales/", "i18n/", "src/i18n/"]
    });
  }
  return patterns;
}

// src/lib/analyzer/code-quality-analyzer.ts
import fs from "fs";
import path from "path";
async function analyzeCodeQuality(rootDir) {
  const result = {
    patterns: [],
    bestPractices: [],
    metrics: {
      componentCount: 0,
      hooksCount: 0,
      utilsCount: 0,
      apiRoutesCount: 0
    }
  };
  const hasTypeScript = await fileExists(path.join(rootDir, "tsconfig.json"));
  result.bestPractices.push({
    name: "TypeScript",
    detected: hasTypeScript,
    details: hasTypeScript ? "Project uses TypeScript for type safety" : "TypeScript not detected"
  });
  const hasESLint = await fileExists(path.join(rootDir, ".eslintrc.js")) || await fileExists(path.join(rootDir, ".eslintrc")) || await fileExists(path.join(rootDir, "eslint.config.js")) || await fileExists(path.join(rootDir, "eslint.config.mjs"));
  result.bestPractices.push({
    name: "ESLint",
    detected: hasESLint,
    details: hasESLint ? "Project uses ESLint for code quality" : "ESLint not detected"
  });
  const hasJest = await fileExists(path.join(rootDir, "jest.config.js")) || await fileExists(path.join(rootDir, "jest.config.ts"));
  result.bestPractices.push({
    name: "Testing",
    detected: hasJest,
    details: hasJest ? "Project has Jest testing setup" : "No testing framework detected"
  });
  result.metrics = await countCodeMetrics(rootDir);
  result.patterns = await detectCodeQualityPatterns(rootDir);
  return result;
}
async function countCodeMetrics(rootDir) {
  const metrics = {
    componentCount: 0,
    hooksCount: 0,
    utilsCount: 0,
    apiRoutesCount: 0
  };
  try {
    const componentsDir = path.join(rootDir, "components");
    if (await fileExists(componentsDir)) {
      const componentFiles = await walkDir(componentsDir, [".tsx", ".jsx"]);
      metrics.componentCount = componentFiles.length;
    }
  } catch (e) {
  }
  try {
    const hooksDir = path.join(rootDir, "hooks");
    if (await fileExists(hooksDir)) {
      const hookFiles = await walkDir(hooksDir, [".ts", ".tsx", ".js", ".jsx"]);
      metrics.hooksCount = hookFiles.length;
    }
    const libDir = path.join(rootDir, "lib");
    if (await fileExists(libDir)) {
      const libFiles = await walkDir(libDir, [".ts", ".js"]);
      metrics.hooksCount += libFiles.filter(
        (file) => path.basename(file).startsWith("use")
      ).length;
    }
  } catch (e) {
  }
  try {
    const utilsDir = path.join(rootDir, "utils");
    if (await fileExists(utilsDir)) {
      const utilsFiles = await walkDir(utilsDir, [".ts", ".js"]);
      metrics.utilsCount = utilsFiles.length;
    }
    const libUtilsDir = path.join(rootDir, "lib/utils");
    if (await fileExists(libUtilsDir)) {
      const libUtilsFiles = await walkDir(libUtilsDir, [".ts", ".js"]);
      metrics.utilsCount += libUtilsFiles.length;
    }
  } catch (e) {
  }
  try {
    const apiDir = path.join(rootDir, "app/api");
    if (await fileExists(apiDir)) {
      const apiFiles = await walkDir(apiDir, [".ts", ".js"]);
      metrics.apiRoutesCount = apiFiles.filter(
        (file) => path.basename(file) === "route.ts" || path.basename(file) === "route.js"
      ).length;
    }
    const pagesApiDir = path.join(rootDir, "pages/api");
    if (await fileExists(pagesApiDir)) {
      const pagesApiFiles = await walkDir(pagesApiDir, [".ts", ".js"]);
      metrics.apiRoutesCount += pagesApiFiles.length;
    }
  } catch (e) {
  }
  return metrics;
}
async function detectCodeQualityPatterns(rootDir) {
  const patterns = [];
  patterns.push({
    name: "Organized Imports",
    description: "Grouped and organized import statements",
    examples: ["React imports first, then libraries, then local modules"],
    locations: ["Throughout the codebase"]
  });
  if (await fileExists(path.join(rootDir, "components"))) {
    patterns.push({
      name: "Component Composition",
      description: "Building complex UIs from smaller, reusable components",
      examples: ["Layout components, UI components, feature components"],
      locations: ["components/"]
    });
  }
  const hasErrorBoundaries = await findFilesWithContent(
    rootDir,
    ["ErrorBoundary", "error.tsx", "error.jsx"],
    [".tsx", ".jsx"]
  );
  if (hasErrorBoundaries.length > 0) {
    patterns.push({
      name: "Error Boundaries",
      description: "Components that catch JavaScript errors and display fallback UI",
      examples: hasErrorBoundaries,
      locations: ["Throughout the codebase"]
    });
  }
  const hasFetchingPatterns = await findFilesWithContent(
    rootDir,
    [
      "useQuery",
      "useSWR",
      "createServerComponent",
      "getData",
      "getServerSideProps"
    ],
    [".ts", ".tsx", ".js", ".jsx"]
  );
  if (hasFetchingPatterns.length > 0) {
    patterns.push({
      name: "Data Fetching Patterns",
      description: "Structured approach to fetching and managing data",
      examples: ["React Query", "SWR", "Server Components"],
      locations: hasFetchingPatterns
    });
  }
  return patterns;
}
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch (e) {
    return false;
  }
}
async function walkDir(dir, extensions = []) {
  if (!await fileExists(dir)) {
    return [];
  }
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkDir(fullPath, extensions);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.length === 0 || extensions.includes(ext)) {
          return [fullPath];
        }
      }
      return [];
    })
  );
  return files.flat();
}
async function findFilesWithContent(rootDir, patterns, extensions = []) {
  const matchingFiles = [];
  try {
    const files = await walkDir(rootDir, extensions);
    for (const file of files) {
      const basename = path.basename(file);
      if (patterns.some((pattern) => basename.includes(pattern))) {
        matchingFiles.push(file);
      }
    }
  } catch (e) {
  }
  return matchingFiles;
}

// src/lib/analyzer/index.ts
async function getAllFilePaths(dirPath, baseDir = dirPath) {
  let files = [];
  const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path2.join(dirPath, entry.name);
    const relativePath = path2.relative(baseDir, fullPath);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git") {
        files = files.concat(await getAllFilePaths(fullPath, baseDir));
      }
    } else {
      files.push(relativePath.replace(/\\/g, "/"));
    }
  }
  return files;
}
async function analyzeProject(projectPath) {
  var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
  if (!fs2.existsSync(projectPath)) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }
  const result = {
    context: {
      projectName: path2.basename(projectPath),
      technologies: [],
      architecturalPatterns: [],
      codePatterns: [],
      bestPracticesObserved: [],
      fileStructure: {
        directories: [],
        entryPoints: [],
        configFiles: []
      },
      analysisMetadata: {
        analyzedAt: /* @__PURE__ */ new Date(),
        overallConfidence: 0
      }
    },
    rawFileContents: {
      packageJson: void 0,
      tsConfig: void 0,
      nextConfig: void 0,
      otherRelevantConfigs: {}
    },
    errors: []
  };
  try {
    const allProjectFiles = await getAllFilePaths(projectPath);
    const packageJsonPath = path2.join(projectPath, "package.json");
    if (fs2.existsSync(packageJsonPath)) {
      const packageJsonRaw = await fsPromises.readFile(
        packageJsonPath,
        "utf-8"
      );
      result.rawFileContents.packageJson = JSON.parse(packageJsonRaw);
      if (result.rawFileContents.packageJson) {
        const packageAnalysis = analyzePackageJson(
          result.rawFileContents.packageJson
        );
        const technologiesFromPackage = packageAnalysis.technologies || [];
        if (result.context.technologies) {
          result.context.technologies.push(...technologiesFromPackage);
        } else {
          result.context.technologies = technologiesFromPackage;
        }
      }
    }
    const tsconfigPath = path2.join(projectPath, "tsconfig.json");
    if (fs2.existsSync(tsconfigPath)) {
      const tsconfigRaw = await fsPromises.readFile(tsconfigPath, "utf-8");
      result.rawFileContents.tsConfig = JSON.parse(tsconfigRaw);
    }
    const nextConfigJsPath = path2.join(projectPath, "next.config.js");
    const nextConfigTsPath = path2.join(projectPath, "next.config.ts");
    let nextConfigPathResolved;
    if (allProjectFiles.includes("next.config.js")) {
      nextConfigPathResolved = nextConfigJsPath;
    } else if (allProjectFiles.includes("next.config.ts")) {
      nextConfigPathResolved = nextConfigTsPath;
    }
    if (nextConfigPathResolved) {
      result.rawFileContents.nextConfig = { path: nextConfigPathResolved };
    }
    const fileStructureResult = analyzeFileStructure(allProjectFiles);
    if (result.context.fileStructure) {
      result.context.fileStructure.directories = ((_a2 = fileStructureResult.fileStructure) == null ? void 0 : _a2.directories) || [];
      result.context.fileStructure.entryPoints = ((_b = fileStructureResult.fileStructure) == null ? void 0 : _b.entryPoints) || [];
      result.context.fileStructure.configFiles = ((_c = fileStructureResult.fileStructure) == null ? void 0 : _c.configFiles) || [];
    }
    if (fileStructureResult.architecturalPatterns) {
      result.context.architecturalPatterns = [
        ...result.context.architecturalPatterns || [],
        ...fileStructureResult.architecturalPatterns
      ];
    }
    if (fileStructureResult.codePatterns) {
      result.context.codePatterns = [
        ...result.context.codePatterns || [],
        ...fileStructureResult.codePatterns
      ];
    }
    const codeQualityResult = await analyzeCodeQuality(projectPath);
    if (codeQualityResult.patterns) {
      result.context.codePatterns = [
        ...result.context.codePatterns || [],
        ...codeQualityResult.patterns
      ];
    }
    const hasPackageJson = !!result.rawFileContents.packageJson;
    const hasTsConfig = !!result.rawFileContents.tsConfig;
    const hasNextConfig = !!result.rawFileContents.nextConfig;
    const componentsInFileStructure = ((_e = (_d = fileStructureResult.fileStructure) == null ? void 0 : _d.commonDirs) == null ? void 0 : _e.includes("components")) || ((_g = (_f = fileStructureResult.fileStructure) == null ? void 0 : _f.directories) == null ? void 0 : _g.includes("components")) || false;
    const pagesInFileStructure = ((_i = (_h = fileStructureResult.fileStructure) == null ? void 0 : _h.commonDirs) == null ? void 0 : _i.includes("pages")) || ((_k = (_j = fileStructureResult.fileStructure) == null ? void 0 : _j.directories) == null ? void 0 : _k.includes("pages")) || false;
    const appInFileStructure = ((_m = (_l = fileStructureResult.fileStructure) == null ? void 0 : _l.commonDirs) == null ? void 0 : _m.includes("app")) || ((_o = (_n = fileStructureResult.fileStructure) == null ? void 0 : _n.directories) == null ? void 0 : _o.includes("app")) || false;
    const hasComponents = ((_q = (_p = result.context.fileStructure) == null ? void 0 : _p.directories) == null ? void 0 : _q.includes("components")) || componentsInFileStructure;
    const hasPages = ((_s = (_r = result.context.fileStructure) == null ? void 0 : _r.directories) == null ? void 0 : _s.includes("pages")) || pagesInFileStructure;
    const hasApp = ((_u = (_t = result.context.fileStructure) == null ? void 0 : _t.directories) == null ? void 0 : _u.includes("app")) || appInFileStructure;
    let confidenceScore = 0.5;
    if (hasPackageJson) confidenceScore += 0.1;
    if (hasTsConfig) confidenceScore += 0.05;
    if (hasNextConfig) confidenceScore += 0.05;
    if (hasComponents) confidenceScore += 0.1;
    if (hasPages || hasApp) confidenceScore += 0.1;
    if (result.context.technologies && result.context.technologies.length > 0)
      confidenceScore += 0.1;
    if (result.context.analysisMetadata) {
      result.context.analysisMetadata.overallConfidence = Math.min(
        1,
        confidenceScore
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during project analysis";
    console.error("Error during project analysis:", error);
    if (result.context.analysisMetadata) {
      result.context.analysisMetadata.overallConfidence = 0.3;
    }
    result.errors = [
      ...result.errors || [],
      { message, sourceAnalyzer: "analyzeProjectCatchBlock" }
    ];
  }
  return result;
}

// src/lib/analyzer/context-storage.ts
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  limit
} from "firebase/firestore";

// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
var firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
var clientApp = initializeApp(firebaseConfig);
var clientDb = getFirestore(clientApp);
var clientAuth = getAuth(clientApp);

// src/lib/firebase-admin.ts
import { initializeApp as initializeApp2, getApps, cert } from "firebase-admin/app";
import { getAuth as getAuth2 } from "firebase-admin/auth";
import { getFirestore as getFirestore2 } from "firebase-admin/firestore";
var _a;
var adminApp = getApps().length === 0 ? initializeApp2({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    // The private key needs to have newlines replaced
    privateKey: (_a = process.env.FIREBASE_ADMIN_PRIVATE_KEY) == null ? void 0 : _a.replace(
      /\\n/g,
      "\n"
    )
  })
  // databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
}) : getApps()[0];
var adminAuth = getAuth2(adminApp);
var adminDb = getFirestore2(adminApp);

// src/lib/analyzer/context-storage.ts
import crypto2 from "crypto";
function hashProjectPath(projectPath) {
  return crypto2.createHash("sha256").update(projectPath).digest("hex");
}
async function storeProjectContext(userId, projectPath, result) {
  const projectHash = hashProjectPath(projectPath);
  const existingContext = await getLatestProjectContext(userId, projectPath);
  if (existingContext) {
    const contextData = {
      projectPath,
      projectHash,
      userId,
      context: result.context,
      updatedAt: Date.now(),
      version: existingContext.version + 1
    };
    const contextRef = doc(clientDb, "projectContexts", existingContext.id);
    await updateDoc(contextRef, contextData);
    return existingContext.id;
  } else {
    const contextData = {
      projectPath,
      projectHash,
      userId,
      context: result.context,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1
    };
    const docRef = await addDoc(
      collection(clientDb, "projectContexts"),
      contextData
    );
    return docRef.id;
  }
}
async function getLatestProjectContext(userId, projectPath) {
  const projectHash = hashProjectPath(projectPath);
  const contextQuery = query(
    collection(clientDb, "projectContexts"),
    where("userId", "==", userId),
    where("projectHash", "==", projectHash),
    orderBy("version", "desc"),
    limit(1)
  );
  const snapshot = await getDocs(contextQuery);
  if (snapshot.empty) {
    return null;
  }
  const doc2 = snapshot.docs[0];
  return {
    id: doc2.id,
    ...doc2.data()
  };
}
async function getUserProjects(userId) {
  const projectHashes = /* @__PURE__ */ new Set();
  const latestVersions = /* @__PURE__ */ new Map();
  const contextQuery = query(
    collection(clientDb, "projectContexts"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(contextQuery);
  for (const doc2 of snapshot.docs) {
    const data = doc2.data();
    const hash = data.projectHash;
    if (!projectHashes.has(hash)) {
      projectHashes.add(hash);
      latestVersions.set(hash, {
        id: doc2.id,
        ...data
      });
    }
  }
  return Array.from(latestVersions.values());
}
async function deleteProjectContext(userId, projectPath) {
  const projectHash = hashProjectPath(projectPath);
  const contextQuery = query(
    collection(clientDb, "projectContexts"),
    where("userId", "==", userId),
    where("projectHash", "==", projectHash)
  );
  const snapshot = await getDocs(contextQuery);
  const deletePromises = snapshot.docs.map((doc2) => deleteDoc(doc2.ref));
  await Promise.all(deletePromises);
}
async function getProjectContextById(contextId) {
  const docRef = adminDb.collection("projectContexts").doc(contextId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return null;
  }
  return {
    id: docSnap.id,
    ...docSnap.data()
  };
}

// src/lib/ai/chains.ts
import { ChatPromptTemplate } from "@langchain/core/prompts";

// src/lib/ai/models.ts
import { ChatOpenAI } from "@langchain/openai";
function createChatModel(modelName, apiKey, options = {}) {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (modelName.includes("gpt")) {
    return new ChatOpenAI({
      modelName,
      openAIApiKey: key,
      ...options
    });
  }
  return new ChatOpenAI({
    modelName: "gpt-4o",
    openAIApiKey: key,
    ...options
  });
}

// src/lib/ai/chains.ts
import { RunnableSequence } from "@langchain/core/runnables";
function createAssistantChain(systemPrompt, modelName = "gpt-4o", apiKey) {
  const model = createChatModel(modelName, apiKey);
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "{input}"]
  ]);
  return RunnableSequence.from([prompt, model]);
}

// src/lib/ai/server.ts
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

// src/lib/ai/context-adapter.ts
import { ChatOpenAI as ChatOpenAI2 } from "@langchain/openai";
import { ChatPromptTemplate as ChatPromptTemplate2 } from "@langchain/core/prompts";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
async function generateContextAwareResponse(message, history, context, config) {
  const llm = new ChatOpenAI2({
    modelName: (config == null ? void 0 : config.model) || "gpt-4o-mini",
    temperature: 0.7,
    streaming: (config == null ? void 0 : config.streaming) || false,
    openAIApiKey: (config == null ? void 0 : config.apiKey) || process.env.OPENAI_API_KEY
  });
  const relevanceScore = await assessContextRelevance(message, context, llm);
  if (relevanceScore > 3 && context) {
    return generateEnhancedResponse(message, context, llm);
  } else {
    return generateStandardResponse(message, llm);
  }
}
async function assessContextRelevance(query2, context, llm) {
  if (!context) {
    return 0;
  }
  const contextSummary = formatContextSummary(context);
  const contextAssessmentPrompt = ChatPromptTemplate2.fromMessages([
    new SystemMessage(
      "You are an expert at determining how relevant project context is to user queries. Analyze the provided project context and determine how relevant it is to answering the user query. Assign a relevance score from 0 (completely irrelevant) to 10 (highly relevant)."
    ),
    new HumanMessage(
      `Project Context: ${contextSummary}

User Query: ${query2}

Assess the relevance of this context to the query on a scale of 0-10 and explain why briefly.`
    )
  ]);
  const assessment = await contextAssessmentPrompt.pipe(llm).invoke({});
  const responseText = assessment.content.toString();
  const relevanceMatch = responseText.match(/\b([0-9]|10)\b/);
  return relevanceMatch ? parseInt(relevanceMatch[0], 10) : 5;
}
async function generateEnhancedResponse(query2, context, llm) {
  const contextString = formatContextSummary(context);
  const contextEnhancedPrompt = ChatPromptTemplate2.fromMessages([
    new SystemMessage(
      `You are an AI assistant with expertise in software development. Use the provided project context to tailor your response to be more relevant and specific to the user's project. Focus particularly on technology choices, architectural patterns, and coding conventions that match the context provided.

${contextString}`
    ),
    new HumanMessage(query2)
  ]);
  const response = await contextEnhancedPrompt.pipe(llm).invoke({});
  return response.content.toString();
}
async function generateStandardResponse(query2, llm) {
  const standardPrompt = ChatPromptTemplate2.fromMessages([
    new SystemMessage(
      "You are an AI assistant with expertise in software development. Provide a helpful answer to the user's query."
    ),
    new HumanMessage(query2)
  ]);
  const response = await standardPrompt.pipe(llm).invoke({});
  return response.content.toString();
}
function formatContextSummary(context) {
  const {
    technologies,
    frameworks,
    architecturalPatterns,
    codePatterns,
    bestPracticesObserved
  } = context;
  return `
PROJECT CONTEXT SUMMARY:
- Technologies: ${(technologies == null ? void 0 : technologies.map((t) => t.name).join(", ")) || "N/A"}
- Frameworks: ${(frameworks == null ? void 0 : frameworks.map((f) => f.name).join(", ")) || "N/A"}
- Architecture: ${(architecturalPatterns == null ? void 0 : architecturalPatterns.map((p) => p.name).join(", ")) || "N/A"}
- Code Patterns: ${(codePatterns == null ? void 0 : codePatterns.map((p) => p.name).join(", ")) || "N/A"}
- Best Practices Observed: ${(bestPracticesObserved == null ? void 0 : bestPracticesObserved.slice(0, 3).join(", ")) || "N/A"}
`;
}

// src/lib/firebase/context-service.ts
import { FieldValue } from "firebase-admin/firestore";
async function getProjectContext(projectId) {
  if (!projectId) {
    console.warn("getProjectContext called with no projectId");
    return null;
  }
  const docRef = adminDb.collection("projectContexts").doc(projectId);
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    const storedData = docSnap.data();
    return storedData.context;
  } else {
    console.log(`No project context found for ID: ${projectId}`);
    return null;
  }
}

// src/lib/ai/server.ts
var openaiModel = openai("gpt-4o");
async function processChat(message, history = [], appContext, projectId) {
  try {
    if (projectId) {
      const projectContext = await getProjectContext(projectId);
      const response2 = await generateContextAwareResponse(
        message,
        // This is potentially augmentedMessage from the API route
        history,
        projectContext
      );
      return response2;
    }
    const systemPrompt = createSystemPrompt(appContext);
    const chain = createAssistantChain(systemPrompt);
    const formattedHistory = history.map((msg) => ({
      role: msg.role === "user" ? "human" : "assistant",
      content: msg.content
    }));
    const response = await chain.invoke({
      input: message,
      // This is potentially augmentedMessage from the API route
      chat_history: formattedHistory
    });
    return response.content;
  } catch (error) {
    console.error("Error processing chat:", error);
    return "Sorry, there was an error processing your request.";
  }
}
async function processChatStream(message, history = [], appContext, projectContextInput) {
  let systemPrompt = "";
  if (projectContextInput) {
    try {
      systemPrompt = createSystemPromptWithContext(
        appContext,
        projectContextInput
      );
    } catch (error) {
      console.error(
        "Error creating system prompt with project context:",
        error
      );
      systemPrompt = createSystemPrompt(appContext);
    }
  } else {
    systemPrompt = createSystemPrompt(appContext);
  }
  const formattedMessages = [
    { id: crypto.randomUUID(), role: "system", content: systemPrompt },
    ...history,
    { id: crypto.randomUUID(), role: "user", content: message }
    // message here already contains RAG + original query
  ];
  try {
    return streamText({
      model: openaiModel,
      // or activeModel if using Groq/other
      messages: formattedMessages,
      temperature: 0.7,
      maxTokens: 2e3
    });
  } catch (error) {
    console.error("AI streaming error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process AI request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
function createSystemPrompt(appContext) {
  let basePrompt = appContext ? `You are an AI assistant for ${appContext}. Be helpful, concise, and friendly.` : "You are a helpful AI assistant.";
  basePrompt += `
When responding, if the user's message contains "Retrieved Context from Codebase", please use that information as the primary source for your answer. If the retrieved context is not relevant or insufficient, use your general knowledge.`;
  return basePrompt;
}
function createSystemPromptWithContext(appContext, projectContext) {
  let prompt = createSystemPrompt(appContext);
  prompt += `
In addition to any retrieved codebase snippets, consider the following general project details. Synthesize all available information for the most comprehensive answer.`;
  if (!projectContext) {
    prompt += "\nNo general project details available for this session.";
    return prompt;
  }
  prompt += `

General Project Details:`;
  if (projectContext.technologies && projectContext.technologies.length > 0) {
    prompt += "\nProject Technologies:";
    prompt += `
${projectContext.technologies.map((t) => t.name).join(", ")}`;
  }
  if (projectContext.frameworks && projectContext.frameworks.length > 0) {
    prompt += "\nFrameworks:";
    prompt += `
${projectContext.frameworks.map((f) => f.name).join(", ")}`;
  }
  if (projectContext.architecturalPatterns && projectContext.architecturalPatterns.length > 0) {
    prompt += "\nArchitecture:";
    prompt += `
${projectContext.architecturalPatterns.map((p) => p.name).join(", ")}`;
  }
  if (projectContext.codePatterns && projectContext.codePatterns.length > 0) {
    prompt += "\nCode Patterns:";
    for (const pattern of projectContext.codePatterns) {
      prompt += `
- ${pattern.name}: ${pattern.description}`;
    }
  }
  if (projectContext.bestPracticesObserved && projectContext.bestPracticesObserved.length > 0) {
    prompt += "\nBest Practices Observed:";
    for (const practice of projectContext.bestPracticesObserved) {
      prompt += `
- ${practice}`;
    }
  }
  prompt += `

When answering questions about this project:
1. Prioritize information from any "Retrieved Context from Codebase" in the user's message.
2. Supplement with these "General Project Details" (technologies, patterns, etc.) for broader understanding.
3. If conflicting, explicitly state the source of your information.
4. Suggest solutions that align with the existing codebase and its established patterns.
5. Use code examples that match the project's style if possible.`;
  return prompt;
}
export {
  AIChatComponent_default as AIChatComponent,
  ChatInput_default as ChatInput,
  MessageItem_default as MessageItem,
  MessageList_default as MessageList,
  analyzeCodeQuality,
  analyzeFileStructure,
  analyzePackageJson,
  analyzeProject,
  createAIAssistant,
  createAssistantChain,
  createSystemPrompt,
  createSystemPromptWithContext,
  deleteProjectContext,
  generateContextAwareResponse,
  getLatestProjectContext,
  getProjectContextById,
  getUserProjects,
  processChat,
  processChatStream,
  storeProjectContext
};
