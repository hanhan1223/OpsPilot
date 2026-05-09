import os


def detect_framework(repo_path: str) -> str:
    files = os.listdir(repo_path)

    if "go.mod" in files:
        return "go"
    if "pom.xml" in files or "build.gradle" in files:
        return "java"
    if "Cargo.toml" in files:
        return "rust"
    if "requirements.txt" in files or "pyproject.toml" in files or "Pipfile" in files:
        if "manage.py" in files:
            return "django"
        return "python"
    if "package.json" in files:
        try:
            import json
            with open(os.path.join(repo_path, "package.json")) as f:
                pkg = json.load(f)
            deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
            if "next" in deps:
                return "nextjs"
            if "nuxt" in deps:
                return "nuxt"
            if "vue" in deps:
                return "vue"
            if "react" in deps:
                return "react"
        except Exception:
            pass
        return "node"
    if "index.html" in files:
        return "static"
    if "Dockerfile" in files:
        return "docker"
    return "unknown"
