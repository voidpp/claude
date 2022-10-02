from pathlib import Path


class Folders:
    root = Path(__file__).parent.parent.resolve()
    project_root = root.parent
    templates = root / "templates"
    static = root / "static"
    frontend = project_root / "frontend"
