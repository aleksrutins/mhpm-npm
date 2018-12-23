((EasyXHR, MHPMScripts) => {
  let npm;
  let PackageRuntimeInstance = packagePath => {
    return {
      require(pkg) {
        if(pkg.startsWith('./')) {
          if(pkg.split('.') < 3) {
            pkg = pkg + '.js';
          }
          return npm.load(packagePath + pkg.slice(2), 'path');
        } else {
          return npm.load(pkg);
        }
      }
    };
  }
  let getPath = (fileOrPath) => {
    if(fileOrPath.endsWith('/')) {
      return fileOrPath; // it's a path
    } else {
      let pathParts = fileOrPath.split('/');
      pathParts.splice(pathParts.length-1, 1);
      return pathParts.join('/') + '/';
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
      let require = PackageRuntimeInstance(pkgPath).require;
      let module = {exports: {}};
      let exports = new Proxy(module.exports, {});
      eval(transformedPkgSrc);
      return module.exports;
    }
  };
  return npm;
})
