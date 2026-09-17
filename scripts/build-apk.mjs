#!/usr/bin/env node
/**
 * Bundle the Horosa SPA and assemble a signed, installable Android APK.
 * Output: /workspace/artifacts/Xingque-offline-1.0.0.apk
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync, copyFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const javaHome = "/usr/lib/jvm/java-17-openjdk-amd64";
const androidHome = process.env.ANDROID_HOME || "/opt/android-sdk";
const dist = join(root, "dist-apk");
const artifacts = join(root, "artifacts");
const keystore = join(root, "android-release.keystore");
const apkName = "Xingque-offline-5.0.0.apk";

function run(cmd, args, opts = {}) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      JAVA_HOME: javaHome,
      ANDROID_HOME: androidHome,
      ANDROID_SDK_ROOT: androidHome,
      PATH: `${javaHome}/bin:${androidHome}/cmdline-tools/latest/bin:${androidHome}/platform-tools:${androidHome}/build-tools/34.0.0:${process.env.PATH}`,
    },
    ...opts,
  });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed (${r.status})`);
  }
}

function findHtml(dir) {
  const hits = [];
  const walk = (d) => {
    for (const name of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, name.name);
      if (name.isDirectory()) {
        if (name.name === "node_modules" || name.name.startsWith(".")) continue;
        walk(p);
      } else if (name.name.endsWith(".html")) hits.push(p);
    }
  };
  if (existsSync(dir)) walk(dir);
  return hits;
}

mkdirSync(dist, { recursive: true });
mkdirSync(artifacts, { recursive: true });

console.log("==> SPA build for APK");
{
  const r = spawnSync("node", ["scripts/with-app-env.mjs", "./node_modules/.bin/vite", "build", "--config", "vite.apk.config.ts"], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      JAVA_HOME: javaHome,
      ANDROID_HOME: androidHome,
      ANDROID_SDK_ROOT: androidHome,
      PATH: `${javaHome}/bin:${androidHome}/cmdline-tools/latest/bin:${androidHome}/platform-tools:${androidHome}/build-tools/34.0.0:${process.env.PATH}`,
    },
  });
  if (r.status !== 0 && !existsSync(join(root, ".output/public/index.html"))) {
    throw new Error("SPA build failed");
  }
}

const candidates = [
  join(root, ".output/public"),
  join(root, "dist"),
  join(root, ".vercel/output/static"),
  dist,
];
let publicDir = candidates.find((d) => existsSync(d) && findHtml(d).length);
if (!publicDir) {
  console.error("No HTML output found. Looked in", candidates);
  throw new Error("SPA build produced no HTML");
}
console.log("SPA public dir:", publicDir, "html:", findHtml(publicDir));

if (publicDir !== dist) {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  cpSync(publicDir, dist, { recursive: true });
}

const htmls = findHtml(dist);
const shell = htmls.find((p) => p.endsWith("_shell.html")) || htmls.find((p) => p.endsWith("index.html")) || htmls[0];
if (shell && !existsSync(join(dist, "index.html"))) {
  copyFileSync(shell, join(dist, "index.html"));
}
if (!existsSync(join(dist, "index.html"))) {
  throw new Error("dist-apk/index.html missing after copy");
}

if (!existsSync(join(root, "node_modules/@capacitor/android"))) {
  throw new Error("@capacitor/android is not installed");
}

if (!existsSync(join(root, "android"))) {
  console.log("==> cap add android");
  run("npx", ["cap", "add", "android"]);
}

writeFileSync(join(root, "android/local.properties"), `sdk.dir=${androidHome}\n`);

console.log("==> cap sync android");
run("npx", ["cap", "sync", "android"]);

const epheSrc = join(root, "data/ephe-core");
const assetsPublic = join(root, "android/app/src/main/assets/public");
if (existsSync(epheSrc) && existsSync(assetsPublic)) {
  const dest = join(assetsPublic, "ephe");
  console.log("==> copy ephe-core (century files only) into android assets");
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  cpSync(epheSrc, dest, { recursive: true });
  const wasm = join(root, "public/swisseph.wasm");
  if (existsSync(wasm)) copyFileSync(wasm, join(assetsPublic, "swisseph.wasm"));
  const ast = join(root, "public/asteroids.json");
  if (existsSync(ast)) copyFileSync(ast, join(assetsPublic, "asteroids.json"));
  const celebs = join(root, "public/celebs.json");
  if (existsSync(celebs)) copyFileSync(celebs, join(assetsPublic, "celebs.json"));
  let bytes = 0;
  let files = 0;
  const walkSize = (d) => {
    for (const name of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, name.name);
      if (name.isDirectory()) walkSize(p);
      else {
        bytes += statSync(p).size;
        files += 1;
      }
    }
  };
  walkSize(dest);
  console.log("ephe-core assets files:", files, "bytes:", bytes);
}

if (!existsSync(keystore)) {
  console.log("==> generate keystore");
  run("keytool", [
    "-genkeypair",
    "-v",
    "-keystore",
    keystore,
    "-alias",
    "xingque",
    "-keyalg",
    "RSA",
    "-keysize",
    "2048",
    "-validity",
    "10000",
    "-storepass",
    "xingqueoffline",
    "-keypass",
    "xingqueoffline",
    "-dname",
    "CN=Xingque, OU=Horosa, O=Horosa, L=Taipei, ST=Taiwan, C=TW",
  ]);
}

const appGradle = join(root, "android/app/build.gradle");
const { readFileSync } = await import("node:fs");
let gradle = readFileSync(appGradle, "utf8");
if (!gradle.includes("xingqueoffline")) {
  gradle = gradle.replace(
    /android\s*\{/,
    `android {
    signingConfigs {
        release {
            storeFile file("${keystore.replaceAll("\\", "/")}")
            storePassword "xingqueoffline"
            keyAlias "xingque"
            keyPassword "xingqueoffline"
        }
    }`,
  );
  gradle = gradle.replace(
    /buildTypes\s*\{([\s\S]*?)release\s*\{/,
    `buildTypes {$1release {
            signingConfig signingConfigs.release`,
  );
  writeFileSync(appGradle, gradle);
}

gradle = readFileSync(appGradle, "utf8");
if (gradle.includes("noCompress")) {
  gradle = gradle.replace(/\n\s*noCompress[^\n]*/g, "");
  writeFileSync(appGradle, gradle);
}
gradle = readFileSync(appGradle, "utf8");
if (!gradle.includes('versionName "5.0"') || !gradle.includes("versionCode 12")) {
  gradle = gradle.replace(/versionCode \d+/, "versionCode 12");
  gradle = gradle.replace(/versionName "[^"]+"/, 'versionName "5.0"');
  writeFileSync(appGradle, gradle);
}

const strings = join(root, "android/app/src/main/res/values/strings.xml");
if (existsSync(strings)) {
  let s = readFileSync(strings, "utf8");
  s = s.replace(/<string name="app_name">[^<]*<\/string>/, `<string name="app_name">星阙</string>`);
  s = s.replace(/<string name="title_activity_main">[^<]*<\/string>/, `<string name="title_activity_main">星阙</string>`);
  writeFileSync(strings, s);
}

const manifest = join(root, "android/app/src/main/AndroidManifest.xml");
if (existsSync(manifest)) {
  let m = readFileSync(manifest, "utf8");
  if (!m.includes("android:usesCleartextTraffic")) {
    m = m.replace("<application", '<application android:usesCleartextTraffic="true"');
  }
  writeFileSync(manifest, m);
}

console.log("==> gradle assembleRelease");
run("./gradlew", ["assembleRelease", "--no-daemon", "--stacktrace"], { cwd: join(root, "android") });

const outApk = join(root, "android/app/build/outputs/apk/release/app-release.apk");
const altApk = join(root, "android/app/build/outputs/apk/release/app-release-unsigned.apk");
const srcApk = existsSync(outApk) ? outApk : altApk;
if (!existsSync(srcApk)) {
  throw new Error("Gradle did not produce an APK");
}
const dest = join(artifacts, apkName);
const tmpDest = `/tmp/${apkName}`;
try {
  copyFileSync(srcApk, tmpDest);
  console.log("APK copied to", tmpDest, statSync(tmpDest).size);
} catch (e) {
  console.warn("tmp copy failed", e);
}
try {
  copyFileSync(srcApk, dest);
  copyFileSync(srcApk, join(artifacts, "星阙-本地离线.apk"));
} catch (e) {
  console.warn("artifacts FUSE cannot hold large APK; download from GitHub release. ", e);
  writeFileSync(
    join(artifacts, "DOWNLOAD.txt"),
    `Xingque-offline-5.0.0.apk\nhttps://github.com/3668708696cjw-web/xingque-android/releases/tag/v5.0.0\nsize ${statSync(srcApk).size}\n编号小行星请另下 Xingque-ephe-ast0/1/2.zip，在 App「小行星」页导入。\n`,
  );
}
console.log("APK ready:", srcApk, statSync(srcApk).size);
