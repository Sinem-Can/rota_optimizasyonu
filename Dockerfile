FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Uyumsoft.RouteOptimizer.csproj", "./"]
RUN dotnet restore "Uyumsoft.RouteOptimizer.csproj"

COPY . .
RUN dotnet publish "Uyumsoft.RouteOptimizer.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet Uyumsoft.RouteOptimizer.dll"]
