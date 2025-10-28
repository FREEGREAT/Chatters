FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["chatters-api.csproj", "."]
RUN dotnet restore "chatters-api.csproj"

COPY . .

RUN dotnet build "chatters-api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "chatters-api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "chatters-api.dll"]