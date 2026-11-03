# syntax=docker/dockerfile:1

# ---------- Build ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Nur csproj für Restore (Layer-Cache)
COPY *.csproj ./
RUN dotnet restore

# Quellcode + Publish
COPY . .
RUN dotnet publish PersonenApi.csproj -c Release -o /app/publish

# ---------- Runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# DB-Verzeichnis (Volume-Ziel), schreibbar für den nicht-root-User (.NET uid 1001)
RUN mkdir -p /app/data && chown -R 1001:1001 /app/data

ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "PersonenApi.dll"]
