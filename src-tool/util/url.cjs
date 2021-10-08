exports.projectRootUrl = new URL('..', `file://${__dirname}`);
exports.srcUrl = new URL('src/', exports.projectRootUrl);
exports.componentsUrl = new URL('components/', exports.srcUrl);
exports.pagesUrl = new URL('pages/', exports.srcUrl);
exports.publicUrl = new URL('public/', exports.projectRootUrl);
