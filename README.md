# Chatters API - Real-Time Chat Backend

This project is the backend service for a real-time chat application built with ASP.NET Core. It uses Azure SignalR for real-time messaging, Azure Cognitive Services for sentiment analysis, Azure SQL for data persistence, and Azure Cache for Redis for session management.

## Features

-   **Real-Time Chat Rooms:** Users can join different chat rooms and communicate in real-time.
-   **Message History:** Retrieves the 50 most recent messages upon joining a room.
-   **Sentiment Analysis:** Automatically analyzes the sentiment of each message (positive, negative, or neutral) and broadcasts the result.
-   **Persistent Storage:** All messages and their sentiment scores are saved to a SQL database.
-   **Intuitive UI:** The frontend is built with modern technologies to ensure a user-friendly and responsive interface.
-   **Session Persistence:** The username is stored locally, simplifying the process of rejoining.

---

## Backend (API)

The backend service forms the core of the application, handling chat logic, connections, and interactions with Azure services.

### Technology Stack (Backend)

-   **Framework:** ASP.NET Core 8
-   **Real-Time Communication:** Azure SignalR Service
-   **Database:** Azure SQL (via Entity Framework Core)
-   **Caching:** Azure Cache for Redis
-   **AI/ML:** Azure Cognitive Services - Text Analytics
-   **Deployment:** Azure App Service

---

## Frontend (UI)

The frontend is a client-side application built with Next.js, providing the user interface for interacting with the chat.

### Features (Frontend)

-   **Modern UI:** Built with Next.js (App Router) and the HeroUI component library.
-   **Client-Side Routing:** Dynamic routes for chat rooms (e.g., `/chat/general`).
-   **State Management:** Uses React Context for managing global state (username, room).
-   **User Persistence:** The username is stored in `localStorage` for convenience.
-   **Sentiment Display:** Messages can be visually distinguished based on their sentiment score.
-   **Reliable Connection:** A custom `useSignalR` hook manages the SignalR connection lifecycle, including automatic reconnection.

### Technology Stack (Frontend)

-   **Framework:** Next.js 14+ (App Router)
-   **Language:** TypeScript
-   **UI Components:** HeroUI
   **Styling:** Tailwind CSS
-   **Real-Time Communication:** `@microsoft/signalr` client library

---


## Project Structure

```

├Chatters/
  ├──backend/
   │    └──chatters-api/
   │        └──chatters-api/
   │            ├── Data/
   │            │   └── ApplicationDbContext.cs   # EF Core database context
   │            ├── Hubs/
   │            │   └── ChatHub.cs              # Main SignalR hub for chat logic
   │            ├── Migrations/
   │            │   └── ...                     # EF Core database migrations
   │            ├── Models/
   │            │   ├── Message.cs              # Data model for a chat message
   │            │   ├── Sentiment.cs            # DTO for sentiment analysis results
   │            │   └── UserConnection.cs       # Record for user session info
   │            ├── Services/
   │            │   ├── ChatService.cs          # Database operations for messages
   │            │   └── CognitiveService.cs     # Interact with Azure Cognitive 
   │            ├── appsettings.json            # Main configuration file
   │            └── Program.cs                  # entry point and service config
   │            
   └──frontend/
        └──app/
            ├──chat/
            │   ├──[room]
            │   │    └──page.tsx
            │   │
            │   ├──components/*
            │   └──hooks/*
            ├──components/*
            │
            ├──page.tsx
            ├──layout.tsx
            ├──providers.tsx
            └──error.tsx
```
## Setup and Configuration

### Prerequisites for Backend

-   [.NET 9 SDK](https://dotnet.microsoft.com/download)
-   [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (for local development, e.g., SQL Express or a Docker container)
-   A Redis instance (for local development, e.g., via Docker)
-   An Azure Account with the following services created:
    -   Azure SignalR Service
    -   Azure Cognitive Service for Language (Text Analytics)
    -   Azure SQL Database
    -   Azure Cache for Redis

### Configuration Steps

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/FREEGREAT/Chatters.git
    cd Chatters
    
    #For backend use dir:
    cd backend/chatters-api/chatters-api

    #For frontend use dir:
    cd frontend
    ```

2.  **Configure User Secrets or `appsettings.Development.json`:**
    Rename `appsettings.json.example` to `appsettings.Development.json` or use .NET User Secrets to store your connection details. Do not commit sensitive keys to your repository.

    **File: `appsettings.Development.json`**
    ```json
    {
      "Logging": {
        "LogLevel": {
          "Default": "Information",
          "Microsoft.AspNetCore": "Warning"
        }
      },
      "ConnectionStrings": {
        "DBConnection": "your_sql_server_connection_string",
        "Redis": "your_redis_connection_string"
      },
      "AzureTextAnalytics": {
        "Endpoint": "your_cognitive_services_endpoint",
        "Key": "your_cognitive_services_api_key"
      },
      "Azure": {
        "SignalR": {
          "Endpoint": "your_signalr_connection_string",
          "Key": "AccessKey",
        }
      }
    }
    ```
    *Note: The current `Program.cs` does not show SignalR connection string configuration. You would typically add `.AddAzureSignalR()` after `.AddSignalR()` and ensure the connection string is present in your configuration.*

3.  **Install EF Core Tools:**
    ```sh
    dotnet tool install --global dotnet-ef
    ```

4.  **Apply Database Migrations:**
    Ensure your `DBConnection` string in the configuration is correct, then run the following command to create the database schema:
    ```sh
    dotnet ef database update
    ```

5.  **Run the Application:**
    ```sh
    dotnet run
    ```
    The application will start, and the SignalR hub will be available at `/chat` on the configured host (e.g., `https://localhost:{port}/chat`).

## API - SignalR Hub

The application exposes a SignalR hub for real-time communication.

**Hub URL:** `/chat`

### Client-to-Server Events (Methods to invoke)

-   **`JoinChat(UserConnection connection)`**
    -   Allows a user to join a specific chat room.
    -   **Payload:**
        ```json
        {
          "userName": "string",
          "chatRoom": "string"
        }
        ```

-   **`SendMessage(string message)`**
    -   Sends a message to the chat room the user has joined.
    -   **Payload:** `string` (the message content)

### Server-to-Client Events (Methods to listen for)

-   **`RecieveMessage(string userName, string message, string? sentimentLabel, double? sentimentScore)`**
    -   Fired when a new message is received in the chat room.
    -   **Parameters:**
        -   `userName`: The name of the user who sent the message.
        -   `message`: The content of the message.
        -   `sentimentLabel`: The analyzed sentiment ("positive", "negative", "neutral").
        -   `sentimentScore`: The confidence score (0.0 - 1.0) for the analyzed sentiment.
#### Running the Frontend

6.  **Navigate to the frontend folder:**
    ```sh
    # From the project root
    cd frontend
    ```

7.  **Install dependencies:**
    ```sh
    npm install
    ```

8.  **Configure environment variables:**
    Create a `.env.local` file in the `frontend` folder and specify the URL of your running backend service.

    **File: `.env.local`**
    ```
    # Replace the URL with your API's address (local or deployed on Azure)
    NEXT_PUBLIC_SIGNALR_URL=https://localhost:7130/chat
    ```
    **Important:** The `NEXT_PUBLIC_` prefix is necessary to make the variable accessible in the browser.

9.  **Run the frontend application:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Deployment

*   **Backend:** It is recommended to deploy to **Azure App Service**. Remember to configure all environment variables (connection strings, keys) in the "Configuration" section of your App Service and enable Web Sockets.
*   **Frontend:** It is recommended to deploy to **Vercel** (from the creators of Next.js) or **Azure Static Web Apps**. Be sure to add the `NEXT_PUBLIC_SIGNALR_URL` environment variable with the public URL of your deployed API.