"""
Parse TypeScript and TSX source code using Tree-sitter.

Responsibilities:
- Parse .ts files
- Parse .tsx files
- Extract ES module import dependencies
- Extract require() dependencies
- Extract export-from dependencies
"""

from tree_sitter import Language, Parser
import tree_sitter_typescript as typescript


# Create separate Tree-sitter languages for TypeScript and TSX.
TS_LANGUAGE = Language(typescript.language_typescript())
TSX_LANGUAGE = Language(typescript.language_tsx())

ts_parser = Parser(TS_LANGUAGE)
tsx_parser = Parser(TSX_LANGUAGE)


def parse_typescript(source_code, tsx=False):
    """Parse TypeScript source. Use TSX grammar for .tsx files."""
    parser = tsx_parser if tsx else ts_parser
    return parser.parse(source_code.encode("utf-8"))


def _extract_string(node):
    """Return a quoted string node's decoded text."""
    try:
        return node.text.decode("utf-8").strip("\"'")
    except (AttributeError, UnicodeDecodeError):
        return ""


def extract_dependencies(source_code, tsx=False):
    """
    Extract local and external dependency specifiers.

    Examples:
        import App from "./App"       -> ./App
        import { x } from "../utils"  -> ../utils
        import "./styles.css"         -> ./styles.css
        require("./helper")           -> ./helper
        export { x } from "./helper" -> ./helper
    """
    tree = parse_typescript(source_code, tsx)
    dependencies = []

    def add_dependency(value):
        if value and value not in dependencies:
            dependencies.append(value)

    def walk(node):
        # ES module imports:
        # import App from "./App";
        # import type { User } from "../types";
        # import "./styles.css";
        if node.type == "import_statement":
            source = node.child_by_field_name("source")
            if source:
                add_dependency(_extract_string(source))

        # CommonJS:
        # require("./utils/helper")
        elif node.type == "call_expression":
            function = node.child_by_field_name("function")

            if function:
                function_text = function.text.decode("utf-8")

                if function_text == "require":
                    arguments = node.child_by_field_name("arguments")

                    if arguments:
                        for child in arguments.named_children:
                            dependency = _extract_string(child)
                            if dependency:
                                add_dependency(dependency)
                                break

        # Re-export:
        # export { helper } from "./helper";
        # export * from "./helper";
        elif node.type == "export_statement":
            source = node.child_by_field_name("source")
            if source:
                add_dependency(_extract_string(source))

        for child in node.children:
            walk(child)

    walk(tree.root_node)
    return dependencies
