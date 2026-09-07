"""
Project analyzer supporting JS, JSX, TS, TSX and Python.
"""

from pathlib import Path

from analyzer.jsAnalysisService import analyze_js_file
from analyzer.tsAnalysisService import analyze_ts_file
from analyzer.pythonAnalysisService import analyze_python_file


SUPPORTED_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".py"}

IGNORED_DIRECTORIES = {
    "node_modules", ".git", "dist", "build", ".next", ".vite",
    "coverage", "__pycache__", "venv", ".venv"
}


def should_ignore(path: Path) -> bool:
    return any(part in IGNORED_DIRECTORIES for part in path.parts)


def analyze_project(project_path):
    project_path = Path(project_path).resolve()
    results = []

    if not project_path.exists() or not project_path.is_dir():
        return [{
            "file": str(project_path),
            "dependencies": [],
            "error": "Project path does not exist or is not a directory."
        }]

    for file_path in project_path.rglob("*"):
        if not file_path.is_file():
            continue

        relative_path = file_path.relative_to(project_path)

        if should_ignore(relative_path):
            continue

        extension = file_path.suffix.lower()

        if extension not in SUPPORTED_EXTENSIONS:
            continue

        try:
            if extension in {".js", ".jsx"}:
                result = analyze_js_file(file_path)
            elif extension in {".ts", ".tsx"}:
                result = analyze_ts_file(file_path)
            else:
                result = analyze_python_file(file_path)

            result["file"] = str(file_path)
            result.setdefault("dependencies", [])
            results.append(result)

        except Exception as error:
            results.append({
                "file": str(file_path),
                "dependencies": [],
                "error": str(error)
            })

    return results
