function sortByPriority(list) {
  return list.sort(by('todo_thing_priority', 'index'));
}

var by = function (name, minor) {
  return function (o, p) {
    var a, b;
    if (o && p && typeof o === 'object' && typeof p === 'object') {
      a = o[name];
      b = p[name];
      if (a === b) {
        return typeof minor === 'function' ? minor(o, p) : 0;
      }
      if (typeof a === typeof b) {
        return a < b ? -1 : 1;
      }
      return typeof a < typeof b ? -1 : 1;
    } else {
      thro("error");
    }
  }
}

module.exports={
  sortByPriority: sortByPriority
}