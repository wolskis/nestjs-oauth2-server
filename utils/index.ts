const validURL = function (str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

const validScope = function (str) {
  var pattern = new RegExp('^[a-zA-Z\d\\-_. \s]+$');
  return !!pattern.test(str);
}

const validGrantType = function (str) {
    var pattern = new RegExp('^[a-zA-Z\\_\s]+$');
    return !!pattern.test(str);
}

const validCodeOrToken = function(str) {
    var pattern = new RegExp('^[a-z0-9]+$');
    return !!pattern.test(str) && str.length === 40;   
}

const validAlphanumeric = function (str) {
    var pattern = new RegExp('^[a-z0-9]+$');
    return !!pattern.test(str);   
}

export default { validURL, validScope, validGrantType, validCodeOrToken, validAlphanumeric };