FROM python:3.12-slim

WORKDIR /app

COPY ../packages/opspilot_core /tmp/opspilot_core
RUN pip install --no-cache-dir /tmp/opspilot_core && rm -rf /tmp/opspilot_core

COPY . .
RUN pip install --no-cache-dir .

RUN mkdir -p /app/data/deployments /app/data/logs

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
