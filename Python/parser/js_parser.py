"""
Parser JavaScript source code using Tree-sitter.

Responsible for:
- Parsing JavaScript source code
- Extracting import dependencies
- Extracting require dependencies
- Extracting export-from dependencies
"""

from tree_sitter import Language, Parser
import tree_sitter_javascript as javascript


# Create JavaScript language
JS_LANGUAGE = Language(javascript.language())


# Create JavaScript parser
parser = Parser(JS_LANGUAGE)


# Parse JavaScript code
def parse_javascript(source_code):
    tree = parser.parse(source_code.encode("utf-8"))
    return tree


# Extract dependencies
def extract_dependencies(source_code):
    tree = parse_javascript(source_code)
    dependencies = []

    # Walk through AST nodes
    def walk(node):

        # Handle ES module imports
        # Example:
        # import HomePage from "./pages/HomePage";
        # -> "./pages/HomePage"
        if node.type == "import_statement":

            source = node.child_by_field_name("source")

            if source:
                dependency = source.text.decode("utf-8").strip("\"'")

                if dependency:
                    dependencies.append(dependency)

        # Handle require()
        # Example:
        # require("./utils/helper");
        # -> "./utils/helper"
        elif node.type == "call_expression":

            function = node.child_by_field_name("function")

            if function and function.type == "identifier":
                if function.text == b"require":

                    arguments = node.child_by_field_name("arguments")

                    if arguments:
                        # Get the actual argument inside require(...)
                        for child in arguments.named_children:
                            dependency = child.text.decode("utf-8").strip("\"'")

                            if dependency:
                                dependencies.append(dependency)
                                break

        # Handle export ... from
        # Example:
        # export { something } from "./utils/helper";
        elif node.type == "export_statement":

            source = node.child_by_field_name("source")

            if source:
                dependency = source.text.decode("utf-8").strip("\"'")

                if dependency:
                    dependencies.append(dependency)

        # Continue walking through child nodes
        for child in node.children:
            walk(child)

    walk(tree.root_node)

    return dependencies