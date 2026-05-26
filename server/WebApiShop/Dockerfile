# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ../Services/Services.csproj ./Services/
COPY ../Repositories/Repositories.csproj ./Repositories/
COPY ../Entities/Entities.csproj ./Entities/
COPY ../DTOs/DTOs.csproj ./DTOs/
COPY EventDressRental.csproj ./

RUN dotnet restore "EventDressRental.csproj"

# Copy everything else and build
COPY . ./
RUN dotnet publish "EventDressRental.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS="http://+:80"
EXPOSE 80
ENTRYPOINT ["dotnet", "EventDressRental.dll"]
