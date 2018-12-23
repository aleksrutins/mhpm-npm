((EasyXHR, MHPMScripts) => {
  let npm;
  let PackageRuntimeInstance = class {
    constructor(packagePath) {
      this._pkgPath = packagePath;
    }
    require(pkg) {
      if(pkg.startsWith('./')) {
        // local to package
        return npm.load(this._pkgPath + pkg.slice(2), 'path');
      } else {
        // npm package
        return npm.load(pkg);
      }
    }
  }
  let getPath = (fileOrPath) => {
    if(fileOrPath.endsWith('/')) {
      return fileOrPath; // it's a path
    } else if(fileOrPath.split('.').length > 1) {
      let pathParts = fileOrPath.split('/');
      pathParts.splice(pathParts.length-1, 1);
      return pathParts.join('/') + '/';
    } else {
      return fileOrPath + '/';
    }
  };
  npm = {
    load(pkgName, context = 'unpkg') {
      MHPMScripts.run("https://unpkg.com/@babel/standalone/babel.min.js"); // load Babel
      let npmPkgSource;
      let pkgPath;
      switch(context) {
        case 'unpkg':
          npmPkgSource = EasyXHR.getSync("https://unpkg.com/" + pkgName);
          pkgPath = getPath("https://unpkg.com/" + pkgName);
          break;
        case 'path':
          npmPkgSource = EasyXHR.getSync(pkgName);
          pkgPath = getPath(pkgName);
          break;
      }
      let transformedPkgSrc = Babel.transform(npmPkgSource, {presets: ['es2015']}).code;
      let require = new PackageRuntimeInstance(pkgPath).require;
      let module = {exports: {}};
      let exports = new Proxy(module.exports, {});
      eval(transformedPkgSrc);
      return module.exports;
    }
  };
  return npm;
})
