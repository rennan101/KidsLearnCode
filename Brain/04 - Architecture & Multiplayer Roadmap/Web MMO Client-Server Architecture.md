# 🌐 Web MMO Client-Server Architecture

#architecture #mmo #websockets #backend #database #server

---

## 🏗️ Topologia da Arquitetura

```mermaid
graph TD
    subgraph "Clientes Web (Browser)"
        Player1["Cliente A (Geralt 2D / Avatar 3D)"]
        Player2["Cliente B (Blockly HUD)"]
        PlayerN["Cliente N (Editor / Jogador)"]
    end

    subgraph "Camada de Rede & Gateway"
        Nginx["Load Balancer / Reverse Proxy"]
        WSServer["Cluster Node.js + Socket.io / WebSockets"]
    end

    subgraph "Serviços & Lógica do Mundo"
        WorldState["World State Manager (20 ticks/sec)"]
        BlocklyValidator["Validador de Código Lua / Desafios"]
        AuthService["Serviço de Autenticação JWT"]
    end

    subgraph "Camada de Persistência"
        Redis["Redis: Cache de Posições e Pub/Sub"]
        Postgres["PostgreSQL / MongoDB: Inventários, Mapas e Contas"]
    end

    Player1 <-->|WSS| Nginx
    Player2 <-->|WSS| Nginx
    PlayerN <-->|WSS| Nginx
    Nginx <--> WSServer
    WSServer <--> WorldState
    WSServer <--> BlocklyValidator
    WSServer <--> AuthService
    WorldState <--> Redis
    AuthService <--> Postgres
    WorldState <--> Postgres
```

---

## ⚡ Pilhas Tecnológicas
* **Frontend**: Vanilla JS / Three.js / Canvas 2D + Google Blockly.
* **Backend de Rede**: Node.js + Socket.io (ou uWebSockets.js para alta performance).
* **Banco de Dados**: PostgreSQL para contas e inventários; MongoDB para estruturas de mapas JSON.
* **Cache em Memória**: Redis para sincronização de instâncias e chat em tempo real.

---

## 🔗 Links Relacionados
* [[Multiplayer Synchronization (WebSockets)]]
* [[Database & Account State Schema]]
* [[Milestones & Sprint Roadmap]]
