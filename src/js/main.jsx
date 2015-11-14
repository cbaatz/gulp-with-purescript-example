// Vendor imports
var React = require("react");
var ReactDOM = require("react-dom");

// Proprietary imports (we can use ES6).
import { greeting } from "Demo.Hello";

// Let's create a simple stateless functional component.
var UI = (props) => (<pre>{props.greeting}</pre>);

ReactDOM.render(<UI greeting={greeting("Alice")} />,
                document.getElementById("app"));
