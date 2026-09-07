"""
Python source parser for Knected.

Extracts local and external import paths from Python files.

Supported:
- import module
- import module.submodule
- import module as alias
- from module import name
- from .module import name
- from ..module import name
"""

from tree_sitter import Language, Parser
import tree_sitter_python as python


# Initialize Python Tree-sitter language
PYTHON_LANGUAGE = Language(python.language())
parser = Parser(PYTHON_LANGUAGE)


def parse_python(source_code):
    """
    Parse Python source code using Tree-sitter.

    Returns:
        Tree-sitter syntax tree
    """
    return parser.parse(source_code.encode("utf-8"))


def extract_dependencies(source_code):
    """
    Extract dependency/import paths from Python source code.

    Examples:

        import os
        import services.auth

        from utils.helper import something
        from .models.user import User
        from ..utils import helper

    Returns:
        List of dependency strings.
    """

    tree = parse_python(source_code)
    dependencies = []

    def add(value):
        """
        Clean and add a dependency if it is not already present.
        """
        value = value.strip().strip("\"'")

        if value and value not in dependencies:
            dependencies.append(value)

    def walk(node):
        """
        Recursively walk the Tree-sitter syntax tree.
        """

        # ---------------------------------------------------------
        # import statement
        #
        # Example:
        # import os
        # import services.auth
        # import a, b
        # import services.auth as auth
        # ---------------------------------------------------------
        if node.type == "import_statement":

            text = node.text.decode("utf-8").strip()

            if text.startswith("import "):

                imports = text[7:]

                for item in imports.split(","):

                    item = item.strip()

                    # Remove alias:
                    # services.auth as auth
                    if " as " in item:
                        item = item.split(" as ", 1)[0]

                    add(item)

        # ---------------------------------------------------------
        # from ... import ... statement
        #
        # Example:
        # from utils.helper import something
        # from .models.user import User
        # from ..utils import helper
        # ---------------------------------------------------------
        elif node.type == "import_from_statement":

            text = node.text.decode("utf-8").strip()

            if text.startswith("from "):

                remainder = text[5:]

                if " import " in remainder:

                    module = remainder.split(
                        " import ",
                        1
                    )[0]

                    add(module)

        # Continue walking through child nodes
        for child in node.children:
            walk(child)

    # Start recursive tree traversal
    walk(tree.root_node)

    return dependencies