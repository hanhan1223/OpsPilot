import asyncio
import os
import git
from loguru import logger
from ..exceptions import DeployError


class GitHubService:
    async def clone_repo(self, repo_url: str, target_path: str, branch: str = "main"):
        def _clone():
            try:
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                if os.path.exists(target_path):
                    import shutil
                    shutil.rmtree(target_path)
                git.Repo.clone_from(repo_url, target_path, branch=branch)
            except git.GitCommandError as e:
                raise DeployError(f"Git clone failed: {e}")
            except Exception as e:
                raise DeployError(f"Clone error: {e}")

        await asyncio.to_thread(_clone)

    async def detect_framework(self, repo_path: str) -> str:
        def _detect():
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

        return await asyncio.to_thread(_detect)
