import click
from rich.console import Console

console = Console()


@click.group()
@click.version_option(version="0.1.0", prog_name="opspilot")
def cli():
    """OpsPilot - AI-driven self-hosted DevOps platform."""
    pass


@cli.group()
def deploy():
    """Deployment commands."""
    pass


@deploy.command("up")
@click.argument("repo_url")
@click.option("--branch", "-b", default="main", help="Git branch to deploy")
@click.option("--name", "-n", default=None, help="Project name")
def deploy_up(repo_url, branch, name):
    """Deploy a GitHub project."""
    console.print(f"[bold green]Deploying:[/bold green] {repo_url}")
    console.print(f"[dim]Branch: {branch}[/dim]")
    if name:
        console.print(f"[dim]Name: {name}[/dim]")
    console.print("[yellow]Deployment started via API...[/yellow]")


@deploy.command()
@click.argument("project_name")
def restart(project_name):
    """Restart a deployed project."""
    console.print(f"[bold]Restarting:[/bold] {project_name}")


@deploy.command()
@click.argument("project_name")
def stop(project_name):
    """Stop a deployed project."""
    console.print(f"[bold]Stopping:[/bold] {project_name}")


@deploy.command()
@click.argument("project_name")
def delete(project_name):
    """Delete a deployed project."""
    console.print(f"[bold red]Deleting:[/bold red] {project_name}")


@deploy.command()
@click.argument("project_name")
@click.option("--tail", "-t", default=100, help="Number of log lines")
@click.option("--follow", "-f", is_flag=True, help="Follow log output")
def logs(project_name, tail, follow):
    """View project deployment logs."""
    console.print(f"[bold]Logs for:[/bold] {project_name}")


@cli.group()
def project():
    """Project management commands."""
    pass


@project.command("list")
@click.option("--status", type=click.Choice(["running", "stopped", "error"]), default=None)
def list_projects(status):
    """List all deployed projects."""
    console.print("[bold]Deployed Projects:[/bold]")


@cli.group()
def ai():
    """AI analysis commands."""
    pass


@ai.command("analyze")
@click.argument("project_name")
@click.option("--type", "report_type", type=click.Choice(["log_analysis", "fault_diagnosis", "repair_suggestion"]), default="log_analysis")
def ai_analyze(project_name, report_type):
    """Analyze a project with AI."""
    console.print(f"[bold]AI Analysis:[/bold] {project_name}")
    console.print(f"[dim]Type: {report_type}[/dim]")


@ai.command("config")
def ai_config():
    """Manage AI configurations."""
    console.print("[bold]AI Configurations:[/bold]")


@cli.group()
def system():
    """System commands."""
    pass


@system.command("status")
def system_status():
    """Show OpsPilot system status."""
    console.print("[bold]OpsPilot System Status:[/bold]")


@cli.group()
def auth():
    """Authentication commands."""
    pass


@auth.command("login")
@click.option("--username", "-u", prompt=True)
@click.password_option()
def login(username, password):
    """Login to OpsPilot."""
    console.print(f"[bold]Logging in as:[/bold] {username}")


@cli.group()
def skill():
    """Skill management commands."""
    pass


@skill.command("list")
def list_skills():
    """List installed skills."""
    console.print("[bold]Installed Skills:[/bold]")


@skill.command("install")
@click.argument("source")
def install_skill(source):
    """Install a skill from path or URL."""
    console.print(f"[bold]Installing skill:[/bold] {source}")


if __name__ == "__main__":
    cli()
