import { existsSync, readFileSync } from "fs";
import { basename, dirname, extname, join } from "path";
import { ModuleFormat } from "rollup";
import { IBundleOptions, IPkg } from "./types";

export const getExistFile = ({
  cwd,
  files,
  returnRelative,
}: {
  cwd: string;
  files: string[];
  returnRelative: boolean;
}) => {
  for (const file of files) {
    const absFilePath = join(cwd, file);
    if (existsSync(absFilePath)) {
      return returnRelative ? file : absFilePath;
    }
  }
};

export const getPkgFile = ({ cwd }: { cwd: string }): IPkg => {
  let pkg = {} as IPkg;
  try {
    pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf-8"));
  } catch (e) {
    // do nothing
  }

  return pkg;
};

export const getFileName = (filePath: string): string => {
  if (!filePath) {
    return "";
  }
  return `${dirname(filePath)}/${basename(filePath, extname(filePath))}`;
};

// filename priority：specific module type file option > top level file option > pkg field value > basename of entry file
export const getOutputFile = (opts: {
  entry: string;
  type: ModuleFormat;
  pkg: IPkg;
  bundleOpts: IBundleOptions;
  minFile?: boolean;
  mjs?: boolean;
}): string => {
  const { entry, type, pkg, bundleOpts, minFile, mjs } = opts;
  const { outDir = "", file, esm, cjs, umd } = bundleOpts;

  const name = basename(entry, extname(entry));

  switch (type) {
    case "esm":
      if (esm && esm.file) {
        return `${outDir}/${esm.file}${mjs ? ".mjs" : ".js"}`;
      }
      if (file) {
        return `${outDir}/${file}${mjs ? ".mjs" : ".esm.js"}`;
      }
      if (pkg.module) {
        return pkg.module;
      }
      if (pkg["jsnext:main"]) {
        return pkg["jsnext:main"];
      }
      return `${outDir}/${name}${mjs ? ".mjs" : ".esm.js"}`;
    case "cjs":
      if (cjs && cjs.file) {
        return `${outDir}/${cjs.file}.js`;
      }
      if (file) {
        return `${outDir}/${file}.js`;
      }
      if (pkg.main) {
        return pkg.main;
      }
      return `${outDir}/${name}.js`;
    case "umd":
      if (umd && umd.file) {
        return `${outDir}/${umd.file}${minFile ? ".min" : ""}.js`;
      }
      if (file) {
        return `${outDir}/${file}.umd${minFile ? ".min" : ""}.js`;
      }
      if (pkg.browser) {
        if (minFile) {
          return `${getFileName(pkg.browser)}.min.js`;
        }
        return pkg.browser;
      }
      return `${outDir}/${name}.umd${minFile ? ".min" : ""}.js`;
    default:
      throw new Error(`Unsupported type ${type}`);
  }
};

const getPkgNameByid = (id: string): string => {
  const splitted = id.split("/");
  // @，@tmp 和 @local 是为了兼容项目本地路径的别名
  if (id.charAt(0) === "@" && splitted[0] !== "@" && splitted[0] !== "@tmp" && splitted[0] !== "@local") {
    return splitted.slice(0, 2).join("/");
  } else {
    return splitted[0];
  }
};

export const testExternal = (pkgs: Set<string>, excludes: string[], id: string): boolean => {
  if (excludes.includes(id)) {
    return false;
  }
  return pkgs.has(getPkgNameByid(id));
};