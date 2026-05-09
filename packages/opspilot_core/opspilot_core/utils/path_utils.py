import re


def sanitize_repo_name(repo_url: str) -> str:
    url = repo_url.rstrip("/")
    if url.endswith(".git"):
        url = url[:-4]

    parts = url.split("/")
    if len(parts) >= 2:
        name = f"{parts[-2]}-{parts[-1]}"
    else:
        name = parts[-1]

    name = re.sub(r"[^a-zA-Z0-9\-]", "-", name)
    name = re.sub(r"-+", "-", name).strip("-")

    return name.lower()
