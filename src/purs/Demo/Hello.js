// module Demo.Hello

exports.salutation = function(name) {
  if (name === undefined) {
    return "Hi there!";
  } else {
    return "Good day, " + name + "!";
  }
}
