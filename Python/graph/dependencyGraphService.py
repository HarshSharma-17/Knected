"""
Build dependency graph from project analysis results.

Responsibilities:
- Create file nodes
- Create dependency edges
- Resolve JavaScript/TypeScript dependencies
- Resolve Python module dependencies
- Ignore external packages
"""

from pathlib import Path
import os
import networkx as nx


SUPPORTED_EXTENSIONS = {
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
}


def build_dependency_graph(analysis_results):
    graph = nx.DiGraph()

    if not analysis_results:
        return graph

    # ---------------------------------------------------------
    # Create file nodes
    # ---------------------------------------------------------

    file_paths = []

    for result in analysis_results:
        file_path = Path(result["file"]).resolve()

        file_paths.append(file_path)

        graph.add_node(
            str(file_path),
            name=file_path.name,
            type="file",
        )

    # ---------------------------------------------------------
    # Find common project root
    # ---------------------------------------------------------

    try:
        project_root = Path(
            os.path.commonpath([str(path) for path in file_paths])
        ).resolve()
    except ValueError:
        project_root = file_paths[0].parent

    # ---------------------------------------------------------
    # Build Python module map
    #
    # Example:
    #
    # services/auth.py
    #       ↓
    # services.auth
    #
    # utils/helpers.py
    #       ↓
    # utils.helpers
    # ---------------------------------------------------------

    python_module_map = {}

    for file_path in file_paths:

        if file_path.suffix != ".py":
            continue

        try:
            relative_path = file_path.relative_to(project_root)
        except ValueError:
            continue

        module_path = relative_path.with_suffix("")

        parts = list(module_path.parts)

        # __init__.py represents the package itself
        if parts and parts[-1] == "__init__":
            parts = parts[:-1]

        if not parts:
            continue

        module_name = ".".join(parts)

        python_module_map[module_name] = file_path

    # ---------------------------------------------------------
    # Create dependency edges
    # ---------------------------------------------------------

    for result in analysis_results:

        source_file = Path(result["file"]).resolve()

        for dependency in result.get("dependencies", []):

            dependency_path = resolve_dependency(
                source_file,
                dependency,
                project_root,
                python_module_map,
            )

            if dependency_path:

                graph.add_edge(
                    str(source_file),
                    str(dependency_path),
                )

    return graph


def resolve_dependency(
    source_file,
    dependency,
    project_root,
    python_module_map,
):
    """
    Resolve a dependency to an actual project file.

    Supports:

    JavaScript:
        ./components/Header
        ../utils/helper

    TypeScript:
        ./components/Header
        ../utils/helper

    Python:
        services.auth
        services.user
        utils.helpers
        models.user

    Python relative imports:
        .utils
        ..models.user
    """

    dependency = dependency.strip("\"'() ")

    if not dependency:
        return None

    # =========================================================
    # Python dependency
    # =========================================================

    if source_file.suffix == ".py":

        # -----------------------------------------------------
        # Relative Python import
        #
        # Example:
        # from .helpers import something
        # -----------------------------------------------------

        if dependency.startswith("."):

            dot_count = 0

            for char in dependency:
                if char == ".":
                    dot_count += 1
                else:
                    break

            module_name = dependency[dot_count:]

            # One dot = current package
            # Two dots = parent package
            base_directory = source_file.parent

            for _ in range(dot_count - 1):
                base_directory = base_directory.parent

            if module_name:
                relative_target = (
                    base_directory /
                    module_name.replace(".", "/")
                ).resolve()

            else:
                relative_target = base_directory.resolve()

            candidates = [
                relative_target.with_suffix(".py"),
                relative_target / "__init__.py",
            ]

            for candidate in candidates:

                if candidate.exists() and candidate.is_file():
                    return candidate

            return None

        # -----------------------------------------------------
        # Absolute/local Python module
        #
        # Example:
        # services.auth
        # utils.helpers
        # models.user
        #
        # External packages such as:
        # os
        # requests
        # numpy
        #
        # won't exist in python_module_map and are ignored.
        # -----------------------------------------------------

        if dependency in python_module_map:
            return python_module_map[dependency]

        # Sometimes Python imports a child symbol:
        #
        # from services.auth import login
        #
        # Parser gives:
        # services.auth
        #
        # So the exact module lookup above handles it.

        return None

    # =========================================================
    # JavaScript / TypeScript dependency
    # =========================================================

    # External packages such as:
    #
    # react
    # express
    # axios
    # mongoose
    #
    # are ignored.
    if not dependency.startswith("."):
        return None

    target = (
        source_file.parent / dependency
    ).resolve()

    # ---------------------------------------------------------
    # Possible JavaScript / TypeScript files
    # ---------------------------------------------------------

    candidates = [
        # Exact path
        target,

        # JavaScript
        target.with_suffix(".js"),
        target.with_suffix(".jsx"),

        # TypeScript
        target.with_suffix(".ts"),
        target.with_suffix(".tsx"),

        # Directory index files
        target / "index.js",
        target / "index.jsx",
        target / "index.ts",
        target / "index.tsx",
    ]

    for candidate in candidates:

        if candidate.exists() and candidate.is_file():
            return candidate

    return None