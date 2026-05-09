from abc import ABC, abstractmethod

import httpx
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models import AIConfig, AIReport, Project, DeployRecord
from ..schemas import AITestConnectionResponse
from ..exceptions import AIError


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    async def test_connection(
        self, base_url: str, model_name: str, api_key: str | None = None
    ) -> AITestConnectionResponse:
        ...

    @abstractmethod
    async def list_models(self, base_url: str, api_key: str | None = None) -> list[str]:
        ...

    @abstractmethod
    async def chat(
        self,
        messages: list[dict],
        model_name: str,
        base_url: str,
        api_key: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> str:
        ...


class OllamaProvider(AIProvider):
    """Ollama API provider (httpx-based)."""

    async def test_connection(
        self, base_url: str, model_name: str, api_key: str | None = None
    ) -> AITestConnectionResponse:
        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.get(f"{base_url}/api/tags", headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m["name"] for m in data.get("models", [])]
                    return AITestConnectionResponse(
                        success=True,
                        message=f"Connected successfully. {len(models)} models available.",
                        models=models,
                    )
                else:
                    return AITestConnectionResponse(
                        success=False,
                        message=f"Connection failed: HTTP {resp.status_code}",
                    )
            except Exception as e:
                return AITestConnectionResponse(
                    success=False, message=f"Connection failed: {str(e)}"
                )

    async def list_models(self, base_url: str, api_key: str | None = None) -> list[str]:
        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{base_url}/api/tags", headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return [m["name"] for m in data.get("models", [])]
            raise AIError(f"Failed to list models: HTTP {resp.status_code}")

    async def chat(
        self,
        messages: list[dict],
        model_name: str,
        base_url: str,
        api_key: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> str:
        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        payload = {
            "model": model_name,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{base_url}/api/chat",
                json=payload,
                headers=headers,
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("message", {}).get("content", "")
            raise AIError(f"AI request failed: HTTP {resp.status_code}")


class OpenAIProvider(AIProvider):
    """OpenAI-compatible API provider (supports any OpenAI-compatible endpoint via base_url)."""

    async def test_connection(
        self, base_url: str, model_name: str, api_key: str | None = None
    ) -> AITestConnectionResponse:
        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=api_key or "sk-placeholder", base_url=base_url)
            models = await client.models.list()
            model_ids = [m.id for m in models.data]
            return AITestConnectionResponse(
                success=True,
                message=f"Connected successfully. {len(model_ids)} models available.",
                models=model_ids,
            )
        except Exception as e:
            return AITestConnectionResponse(
                success=False, message=f"Connection failed: {str(e)}"
            )

    async def list_models(self, base_url: str, api_key: str | None = None) -> list[str]:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=api_key or "sk-placeholder", base_url=base_url)
        models = await client.models.list()
        return [m.id for m in models.data]

    async def chat(
        self,
        messages: list[dict],
        model_name: str,
        base_url: str,
        api_key: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> str:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=api_key or "sk-placeholder", base_url=base_url)
        response = await client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""


class AnthropicProvider(AIProvider):
    """Anthropic Claude API provider."""

    async def test_connection(
        self, base_url: str, model_name: str, api_key: str | None = None
    ) -> AITestConnectionResponse:
        if not api_key:
            return AITestConnectionResponse(
                success=False, message="API key is required for Anthropic"
            )
        try:
            import anthropic

            client = anthropic.AsyncAnthropic(api_key=api_key)
            # Anthropic has no models list endpoint; test with a minimal message
            response = await client.messages.create(
                model=model_name,
                max_tokens=10,
                messages=[{"role": "user", "content": "Hi"}],
            )
            return AITestConnectionResponse(
                success=True,
                message=f"Connected successfully. Model '{model_name}' is available.",
                models=[model_name],
            )
        except Exception as e:
            return AITestConnectionResponse(
                success=False, message=f"Connection failed: {str(e)}"
            )

    async def list_models(self, base_url: str, api_key: str | None = None) -> list[str]:
        # Anthropic does not have a models list endpoint
        # Return common Claude models
        return [
            "claude-sonnet-4-20250514",
            "claude-haiku-4-20250514",
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022",
            "claude-3-opus-20240229",
        ]

    async def chat(
        self,
        messages: list[dict],
        model_name: str,
        base_url: str,
        api_key: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> str:
        if not api_key:
            raise AIError("API key is required for Anthropic")

        import anthropic

        client = anthropic.AsyncAnthropic(api_key=api_key)

        # Extract system message if present
        system_message = None
        chat_messages = []
        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                chat_messages.append(msg)

        # If no non-system messages, add a placeholder
        if not chat_messages:
            chat_messages = [{"role": "user", "content": "Hello"}]

        kwargs = {
            "model": model_name,
            "max_tokens": max_tokens,
            "messages": chat_messages,
            "temperature": temperature,
        }
        if system_message:
            kwargs["system"] = system_message

        response = await client.messages.create(**kwargs)
        return response.content[0].text


def get_provider(provider_name: str) -> AIProvider:
    """Factory function to get the appropriate AI provider."""
    providers = {
        "ollama": OllamaProvider,
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
    }
    provider_class = providers.get(provider_name)
    if not provider_class:
        raise AIError(f"Unknown provider: {provider_name}. Must be one of {list(providers.keys())}")
    return provider_class()


class AIService:
    """Facade service for AI operations. Delegates to provider-specific implementations."""

    async def test_connection(
        self, provider: str, base_url: str, model_name: str, api_key: str | None = None
    ) -> AITestConnectionResponse:
        p = get_provider(provider)
        return await p.test_connection(base_url, model_name, api_key)

    async def list_models(self, provider: str, base_url: str, api_key: str | None = None) -> list[str]:
        p = get_provider(provider)
        return await p.list_models(base_url, api_key)

    async def chat(
        self,
        messages: list[dict],
        config: AIConfig,
    ) -> str:
        p = get_provider(config.provider)
        return await p.chat(
            messages=messages,
            model_name=config.model_name,
            base_url=config.base_url,
            api_key=config.api_key,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
        )

    async def analyze_project(
        self,
        db: AsyncSession,
        project_id: int,
        report_type: str,
        config: AIConfig,
    ) -> AIReport:
        project_result = await db.execute(
            select(Project).where(Project.id == project_id)
        )
        project = project_result.scalar_one_or_none()
        if not project:
            raise AIError("Project not found")

        deploy_result = await db.execute(
            select(DeployRecord)
            .where(DeployRecord.project_id == project_id)
            .order_by(DeployRecord.id.desc())
            .limit(1)
        )
        deploy = deploy_result.scalar_one_or_none()

        logs = deploy.logs if deploy else "No deployment logs available."

        prompts = {
            "log_analysis": f"""Analyze the following deployment logs for project '{project.name}':
Repository: {project.repo_url}
Status: {project.status}

Logs:
{logs}

Provide:
1. Summary of what happened
2. Any errors or warnings found
3. Performance observations
4. Recommendations""",
            "fault_diagnosis": f"""Diagnose the fault in project '{project.name}':
Repository: {project.repo_url}
Status: {project.status}

Logs:
{logs}

Provide:
1. Root cause analysis
2. Error classification (critical/warning/info)
3. Affected components
4. Step-by-step diagnosis""",
            "repair_suggestion": f"""Suggest repairs for project '{project.name}':
Repository: {project.repo_url}
Status: {project.status}

Logs:
{logs}

Provide:
1. Immediate fixes (with exact commands if applicable)
2. Configuration changes needed
3. Code modifications suggested
4. Prevention measures""",
        }

        prompt = prompts.get(report_type, prompts["log_analysis"])
        messages = [{"role": "user", "content": prompt}]

        content = await self.chat(messages, config)

        report = AIReport(
            project_id=project_id,
            config_id=config.id,
            report_type=report_type,
            content=content,
        )
        db.add(report)
        await db.commit()
        await db.refresh(report)

        return report
